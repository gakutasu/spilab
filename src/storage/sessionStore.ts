import type { AnswerResult } from '../types';

export const SESSION_KEY = 'spilab.activeSession';

export type SessionPhase = 'ready' | 'answering' | 'answered';

export interface SessionResult {
  questionId: string;
  result: AnswerResult;
  answerTimeMs: number;
  selectedChoice: number | null;
}

export interface ActiveSession {
  /** Local date (YYYY-MM-DD) the session was created. */
  date: string;
  questionIds: string[];
  currentIndex: number;
  phase: SessionPhase;
  /** Date.now() when the current question was started. */
  startedAt: number | null;
  selectedChoice: number | null;
  lastResult: SessionResult | null;
  results: SessionResult[];
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is ActiveSession {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.date === 'string' &&
    Array.isArray(v.questionIds) &&
    typeof v.currentIndex === 'number' &&
    (v.phase === 'ready' || v.phase === 'answering' || v.phase === 'answered') &&
    Array.isArray(v.results)
  );
}

export function loadSession(): ActiveSession | null {
  const raw = storage()?.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: ActiveSession): void {
  storage()?.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  storage()?.removeItem(SESSION_KEY);
}
