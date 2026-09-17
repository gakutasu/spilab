import type { Evaluation } from '../types';

export const MIN_ATTEMPTS_FOR_EVALUATION = 3;
export const STRONG_THRESHOLD = 75;
export const WEAK_THRESHOLD = 45;

export const EVALUATION_LABEL: Record<Evaluation, string> = {
  strong: '得意',
  normal: '普通',
  weak: '苦手',
  unrated: '未評価',
};

export function evaluate(score: number, attempts: number): Evaluation {
  if (attempts < MIN_ATTEMPTS_FOR_EVALUATION) return 'unrated';
  if (score >= STRONG_THRESHOLD) return 'strong';
  if (score < WEAK_THRESHOLD) return 'weak';
  return 'normal';
}
