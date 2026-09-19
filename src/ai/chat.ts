import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AnswerResult, Question } from '../types';
import { CHOICE_LABELS } from '../utils/format';

export type ChatProvider = 'anthropic' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ModelChoice {
  id: string;
  label: string;
}

export const PROVIDER_LABEL: Record<ChatProvider, string> = { anthropic: 'Claude（Anthropic）', openai: 'OpenAI' };

export const DEFAULT_MODELS: Record<ChatProvider, ModelChoice[]> = {
  anthropic: [
    { id: 'claude-opus-5', label: 'Claude Opus 5（推奨）' },
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  ],
  openai: [
    { id: 'gpt-5.4', label: 'GPT-5.4' },
    { id: 'gpt-5', label: 'GPT-5' },
    { id: 'gpt-5-mini', label: 'GPT-5 mini' },
  ],
};

export const KEY_PAGE: Record<ChatProvider, string> = {
  anthropic: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
};

const RESULT_LABEL: Record<AnswerResult, string> = { correct: '正解', incorrect: '不正解', unknown: '「わからない」を選択' };

export interface TutorContext {
  question: Question;
  selectedChoice: number | null;
  result: AnswerResult;
  answerTimeMs: number;
}

/** System prompt: a patient SPI tutor who knows this exact question and the learner's answer. */
export function buildTutorSystemPrompt(ctx: TutorContext): string {
  const q = ctx.question;
  const choices = q.choices.map((c, i) => `${CHOICE_LABELS[i]}. ${c}`).join('\n');
  const yours = ctx.selectedChoice === null ? 'わからない' : `${CHOICE_LABELS[ctx.selectedChoice]}. ${q.choices[ctx.selectedChoice]}`;
  return `あなたはSPI（総合適性検査）対策の家庭教師です。学習者はいま下の問題を解き終え、解説を読んだうえで質問しています。

回答の方針:
- 日本語で、簡潔に、ただし省略せず段階を追って説明する。
- 解説の繰り返しではなく、質問された点に正面から答える。式や途中計算は1行ずつ示す。
- 数式はLaTeXを使わず、「7 × 6 = 42」「3/8」のような平文で書く。
- 誤答についての質問には、「その考え方だと何が起きるか」を計算して示す。
- 別解を求められたら、まず一番簡単な方法を示す。
- 学習者を励ますが、お世辞は不要。最後に一言、次に同じ型の問題を解くときの着眼点を添える。
- 見出しは「## 」、箇条書きは「- 」、強調は「**」で書く。

【問題】
${q.passage ? `${q.passage}\n\n` : ''}${q.question}

【選択肢】
${choices}

【正解】${CHOICE_LABELS[q.correctChoice]}. ${q.choices[q.correctChoice]}
【学習者の回答】${yours}（${RESULT_LABEL[ctx.result]}、解答時間 ${Math.round(ctx.answerTimeMs / 1000)}秒、目安 ${q.recommendedTime}秒）

【アプリの解説】
${q.explanation}`;
}

export const PRESET_QUESTIONS: Array<{ label: string; text: string; when?: AnswerResult[] }> = [
  { label: 'なぜその式になる？', text: '解説の式がなぜそうなるのか、考え方の出発点から順に説明してください。' },
  { label: '別の解き方は？', text: 'この問題を別の方法で解くとどうなりますか。一番簡単な別解を教えてください。' },
  { label: '自分の答えはなぜ違う？', text: '私が選んだ答えはどこで間違えたのか、私の考え方をたどって説明してください。', when: ['incorrect'] },
  { label: 'どこから手をつける？', text: 'この問題を見たとき、最初に何を考えればよいですか。手順を教えてください。', when: ['unknown', 'incorrect'] },
  { label: '速く解くコツは？', text: '目安時間内に解くためのコツや、省略できる計算はありますか。', when: ['correct'] },
  { label: '類題を1問出して', text: '同じ考え方を使う類題を1問出してください。答えはまだ見せないでください。' },
];

export interface StreamOptions {
  provider: ChatProvider;
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

/** Streams one assistant reply and resolves with the full text. */
export async function streamChat(opts: StreamOptions): Promise<string> {
  let full = '';
  const push = (t: string) => {
    if (!t) return;
    full += t;
    opts.onDelta(t);
  };

  if (opts.provider === 'anthropic') {
    const client = new Anthropic({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true });
    const stream = client.messages.stream(
      { model: opts.model, max_tokens: 4000, system: opts.system, messages: opts.messages },
      { signal: opts.signal },
    );
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') push(event.delta.text);
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') throw new Error('モデルが回答を拒否しました。質問を変えてみてください。');
    return full;
  }

  const client = new OpenAI({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true });
  const stream = await client.responses.create(
    {
      model: opts.model,
      instructions: opts.system,
      input: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
    },
    { signal: opts.signal },
  );
  for await (const event of stream) {
    if (event.type === 'response.output_text.delta') push(event.delta);
    if (event.type === 'response.failed') throw new Error(event.response.error?.message ?? '応答に失敗しました。');
  }
  return full;
}

/** Fetches the models available to this key. */
export async function listModels(provider: ChatProvider, apiKey: string): Promise<ModelChoice[]> {
  if (provider === 'anthropic') {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
    const out: ModelChoice[] = [];
    for await (const m of client.models.list()) out.push({ id: m.id, label: m.display_name || m.id });
    return out;
  }
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const out: ModelChoice[] = [];
  for await (const m of client.models.list()) {
    if (/^(gpt|o\d)/.test(m.id) && !/(audio|realtime|tts|transcribe|image|embedding|search|moderation|instruct)/.test(m.id)) out.push({ id: m.id, label: m.id });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export function describeChatError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError || error instanceof OpenAI.AuthenticationError) return 'APIキーが無効です。設定画面で確認してください。';
  if (error instanceof Anthropic.RateLimitError || error instanceof OpenAI.RateLimitError) return 'レート制限に達しました。少し待ってから再試行してください。';
  if (error instanceof Anthropic.NotFoundError || error instanceof OpenAI.NotFoundError) return 'モデルが見つかりません。設定画面でモデルを選び直してください。';
  if (error instanceof Anthropic.APIConnectionError || error instanceof OpenAI.APIConnectionError) return 'APIに接続できませんでした。ネットワークを確認してください。';
  if (error instanceof Anthropic.APIError || error instanceof OpenAI.APIError) return `APIエラー（${error.status ?? '?'}）：${error.message}`;
  if (error instanceof DOMException && error.name === 'AbortError') return '中断しました。';
  if (error instanceof Error) return error.message;
  return '不明なエラーが発生しました。';
}
