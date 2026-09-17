import type { AnswerResult } from '../types';
import { timeBand, timeRatio } from './timeRatio';

export const INITIAL_MASTERY = 50;
export const MIN_MASTERY = 0;
export const MAX_MASTERY = 100;

export function masteryDelta(result: AnswerResult, ratio: number): number {
  if (result === 'unknown') return -10;
  if (result === 'incorrect') return -7;
  switch (timeBand(ratio)) {
    case 'fast':
      return 8;
    case 'slow':
      return 5;
    case 'very_slow':
      return 2;
  }
}

export function applyMastery(score: number, result: AnswerResult, ratio: number): number {
  const next = score + masteryDelta(result, ratio);
  return Math.min(MAX_MASTERY, Math.max(MIN_MASTERY, next));
}

export interface MasteryEvent {
  result: AnswerResult;
  answerTimeMs: number;
  recommendedTime: number;
}

/** Replays events in the given (chronological) order from the initial score. */
export function computeMastery(events: MasteryEvent[]): number {
  let score = INITIAL_MASTERY;
  for (const e of events) {
    score = applyMastery(score, e.result, timeRatio(e.answerTimeMs, e.recommendedTime));
  }
  return score;
}
