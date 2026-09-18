import Anthropic from '@anthropic-ai/sdk';
import type { Question } from '../types';
import { TOPICS, type TopicId } from '../questions/topics';
import { validateQuestions } from '../questions/validate';
import { GENERATION_SCHEMA, VERIFY_SCHEMA } from './schema';
import { SYSTEM_PROMPT, VERIFY_SYSTEM_PROMPT, buildGenerationPrompt, buildVerifyPrompt } from './prompts';
import { modelOption } from './models';

export interface Verification {
  answerIndex: number;
  agrees: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  issues: string;
}

export interface GeneratedDraft {
  question: Question;
  selfCheck: string;
  verification: Verification | null;
}

interface RawGenerated {
  question: string;
  passage: string;
  choices: string[];
  correctChoice: number;
  difficulty: number;
  recommendedTime: number;
  subtopic: string;
  tags: string[];
  explanation: string;
  selfCheck: string;
}

/** Converts the model's JSON text into validated questions. Invalid items are reported, not thrown. */
export function parseGeneratedPayload(
  text: string,
  ctx: { topic: TopicId; nextId: (index: number) => string },
): { drafts: GeneratedDraft[]; errors: string[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { drafts: [], errors: ['応答をJSONとして解釈できませんでした。'] };
  }
  const list = (parsed as { questions?: unknown })?.questions;
  if (!Array.isArray(list)) return { drafts: [], errors: ['応答に questions 配列がありません。'] };

  const drafts: GeneratedDraft[] = [];
  const errors: string[] = [];
  list.forEach((item, i) => {
    const r = item as Partial<RawGenerated>;
    const choices = Array.isArray(r.choices) ? r.choices.map((c) => String(c).trim()) : [];
    const question: Question = {
      id: ctx.nextId(i),
      category: TOPICS[ctx.topic].category,
      topic: ctx.topic,
      subtopic: typeof r.subtopic === 'string' && r.subtopic ? r.subtopic : undefined,
      difficulty: (r.difficulty === 1 || r.difficulty === 2 || r.difficulty === 3 ? r.difficulty : 2) as 1 | 2 | 3,
      question: typeof r.question === 'string' ? r.question.trim() : '',
      passage: typeof r.passage === 'string' && r.passage.trim() ? r.passage.trim() : undefined,
      choices: [choices[0] ?? '', choices[1] ?? '', choices[2] ?? '', choices[3] ?? ''],
      correctChoice: (typeof r.correctChoice === 'number' ? r.correctChoice : -1) as Question['correctChoice'],
      recommendedTime: typeof r.recommendedTime === 'number' && r.recommendedTime > 0 ? Math.round(r.recommendedTime) : 60,
      explanation: typeof r.explanation === 'string' ? r.explanation.trim() : '',
      tags: Array.isArray(r.tags) ? r.tags.map(String).filter(Boolean) : [],
    };
    if (choices.length !== 4) {
      errors.push(`${i + 1}問目: 選択肢が4つではありません。`);
      return;
    }
    const problems = validateQuestions([question]);
    if (problems.length) {
      errors.push(`${i + 1}問目: ${problems[0]}`);
      return;
    }
    drafts.push({ question, selfCheck: typeof r.selfCheck === 'string' ? r.selfCheck : '', verification: null });
  });
  return { drafts, errors };
}

function textOf(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('');
}

function requestOptions(model: string) {
  const opt = modelOption(model);
  return {
    ...(opt.supportsFallbacks ? { betas: ['server-side-fallback-2026-07-01' as const], fallbacks: 'default' as const } : {}),
    effort: opt.supportsEffort,
  };
}

export interface GenerateOptions {
  model: string;
  topic: TopicId;
  count: number;
  difficulty: 1 | 2 | 3 | null;
  examples: Question[];
  existingStems: string[];
  /** Allocates the built-in style id for the i-th generated question. */
  nextId: (index: number) => string;
}

export async function generateQuestions(client: Anthropic, opts: GenerateOptions): Promise<{ drafts: GeneratedDraft[]; errors: string[] }> {
  const { betas, fallbacks, effort } = requestOptions(opts.model);
  const response = await client.beta.messages.create({
    model: opts.model,
    max_tokens: 16000,
    ...(betas ? { betas, fallbacks } : {}),
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildGenerationPrompt(opts) }],
    output_config: {
      format: { type: 'json_schema', schema: GENERATION_SCHEMA as unknown as Record<string, unknown> },
      ...(effort ? { effort: 'high' } : {}),
    },
  });
  if (response.stop_reason === 'refusal') throw new Error('モデルが生成を拒否しました。分野や条件を変えて再試行してください。');
  if (response.stop_reason === 'max_tokens') throw new Error('応答が長すぎて途中で切れました。作成数を減らして再試行してください。');
  return parseGeneratedPayload(textOf(response.content), { topic: opts.topic, nextId: opts.nextId });
}

export function parseVerification(text: string, correctChoice: number): Verification {
  const v = JSON.parse(text) as Partial<Verification>;
  const answerIndex = typeof v.answerIndex === 'number' ? v.answerIndex : -1;
  return {
    answerIndex,
    agrees: answerIndex === correctChoice,
    confidence: v.confidence === 'high' || v.confidence === 'medium' || v.confidence === 'low' ? v.confidence : 'low',
    reasoning: typeof v.reasoning === 'string' ? v.reasoning : '',
    issues: typeof v.issues === 'string' ? v.issues : '',
  };
}

/** Independently solves the question (without seeing the explanation) and compares with correctChoice. */
export async function verifyQuestion(client: Anthropic, model: string, question: Question): Promise<Verification> {
  const { betas, fallbacks, effort } = requestOptions(model);
  const response = await client.beta.messages.create({
    model,
    max_tokens: 8000,
    ...(betas ? { betas, fallbacks } : {}),
    system: VERIFY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildVerifyPrompt(question) }],
    output_config: {
      format: { type: 'json_schema', schema: VERIFY_SCHEMA as unknown as Record<string, unknown> },
      ...(effort ? { effort: 'high' } : {}),
    },
  });
  if (response.stop_reason === 'refusal') throw new Error('モデルが検算を拒否しました。');
  return parseVerification(textOf(response.content), question.correctChoice);
}

export function describeApiError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return 'APIキーが無効です。設定画面で確認してください。';
  if (error instanceof Anthropic.PermissionDeniedError) return 'このAPIキーには権限がありません。';
  if (error instanceof Anthropic.RateLimitError) return 'レート制限に達しました。しばらく待ってから再試行してください。';
  if (error instanceof Anthropic.BadRequestError) return `リクエストが不正です：${error.message}`;
  if (error instanceof Anthropic.APIConnectionError) return 'Anthropic APIに接続できませんでした。ネットワークを確認してください。';
  if (error instanceof Anthropic.APIError) return `APIエラー（${error.status ?? '?'}）：${error.message}`;
  if (error instanceof Error) return error.message;
  return '不明なエラーが発生しました。';
}
