import type { TopicId } from './questions/topics';

export type Category = 'verbal' | 'nonverbal' | 'english';
export type AnswerResult = 'correct' | 'incorrect' | 'unknown';
export type Evaluation = 'strong' | 'normal' | 'weak' | 'unrated';
export type ChoiceIndex = 0 | 1 | 2 | 3;

/** What a practice session draws from. */
export type SessionScope = { kind: 'all' } | { kind: 'category'; category: Category } | { kind: 'topic'; topic: import('./questions/topics').TopicId };

export interface Question {
  id: string;
  category: Category;
  topic: TopicId;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  question: string;
  /** Reference text shown above the question (reading comprehension etc.). */
  passage?: string;
  choices: [string, string, string, string];
  correctChoice: ChoiceIndex;
  /** Recommended time in seconds. */
  recommendedTime: number;
  /** Simple markdown: "## " headings, blank-line separated paragraphs. */
  explanation: string;
  tags: string[];
}

export interface AnswerRecord {
  id?: number;
  questionId: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
  /** null when the user chose "わからない". */
  selectedChoice: number | null;
  result: AnswerResult;
  answerTimeMs: number;
}

export type AiProvider = 'anthropic' | 'openai';

export interface Settings {
  questionsPerDay: number;
  /** Delivery formats to practise for; topics outside them are not asked. */
  formats: { testcenter: boolean; paper: boolean };
  /** Whether the optional English section is included. */
  includeEnglish: boolean;
  /** Provider used by the "ask AI" panel after answering. */
  aiProvider: AiProvider;
  /** Selected model id per provider. */
  aiModels: Record<AiProvider, string>;
}

export const DEFAULT_SETTINGS: Settings = {
  questionsPerDay: 7,
  formats: { testcenter: true, paper: false },
  includeEnglish: false,
  aiProvider: 'anthropic',
  aiModels: { anthropic: 'claude-opus-5', openai: 'gpt-5.4' },
};
export const QUESTIONS_PER_DAY_OPTIONS = [5, 7, 10, 15] as const;
