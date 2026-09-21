import type { AnswerResult, SessionScope } from '../types';

export const SESSION_KEY = 'spilab.activeSession';
export const PRACTICE_SESSION_KEY = 'spilab.practiceSession';

export type SessionSlot = 'daily' | 'practice';

function keyOf(slot: SessionSlot): string {
  return slot === 'daily' ? SESSION_KEY : PRACTICE_SESSION_KEY;
}

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
  /** Absent in sessions saved before scopes existed (= all). */
  scope?: SessionScope;
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

export function loadSession(slot: SessionSlot = 'daily'): ActiveSession | null {
  const raw = storage()?.getItem(keyOf(slot));
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: ActiveSession, slot: SessionSlot = 'daily'): void {
  storage()?.setItem(keyOf(slot), JSON.stringify(session));
}

export function clearSession(slot: SessionSlot = 'daily'): void {
  storage()?.removeItem(keyOf(slot));
}
