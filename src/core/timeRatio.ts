export type TimeBand = 'fast' | 'slow' | 'very_slow';

export const TIME_BAND_LABEL: Record<TimeBand, string> = {
  fast: '速い / 適正',
  slow: 'やや時間がかかっている',
  very_slow: '時間面でも要復習',
};

/** answerTimeMs / recommendedTime (seconds). Infinity when recommendedTime is not positive. */
export function timeRatio(answerTimeMs: number, recommendedTimeSec: number): number {
  if (!(recommendedTimeSec > 0)) return Infinity;
  return answerTimeMs / 1000 / recommendedTimeSec;
}

export function timeBand(ratio: number): TimeBand {
  if (ratio <= 1.0) return 'fast';
  if (ratio <= 1.5) return 'slow';
  return 'very_slow';
}
