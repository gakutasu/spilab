import type { TopicId } from './questions/topics';

export type Category = 'verbal' | 'nonverbal';
export type AnswerResult = 'correct' | 'incorrect' | 'unknown';
export type Evaluation = 'strong' | 'normal' | 'weak' | 'unrated';
export type ChoiceIndex = 0 | 1 | 2 | 3;

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
  /** Absent for built-in questions. */
  source?: 'ai';
  /** ISO timestamp for generated questions. */
  createdAt?: string;
  /** Model id that generated the question. */
  generatedBy?: string;
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

export interface Settings {
  questionsPerDay: number;
  /** Claude model id used for AI question generation. */
  aiModel: string;
  /** Run a second, independent solve to confirm generated answers. */
  aiVerify: boolean;
}

export const DEFAULT_SETTINGS: Settings = { questionsPerDay: 7, aiModel: 'claude-opus-5', aiVerify: true };
export const QUESTIONS_PER_DAY_OPTIONS = [5, 7, 10, 15] as const;
