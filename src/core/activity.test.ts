import type { AnswerRecord } from '../types';
import { dailyCounts, heatmapWeeks, activityLevel } from './activity';

function rec(y: number, m: number, d: number, h = 10): AnswerRecord {
  return { questionId: 'q', timestamp: new Date(y, m - 1, d, h).toISOString(), result: 'correct', answerTimeMs: 1, selectedChoice: 0 };
}

describe('dailyCounts', () => {
  it('counts answers per local day', () => {
    const c = dailyCounts([rec(2026, 9, 18, 1), rec(2026, 9, 18, 23), rec(2026, 9, 19)]);
    expect(c.get('2026-09-18')).toBe(2);
    expect(c.get('2026-09-19')).toBe(1);
  });
});

describe('activityLevel', () => {
  it('maps counts to 0..4', () => {
    expect([0, 1, 3, 4, 7, 8, 14, 15, 40].map(activityLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });
});

describe('heatmapWeeks', () => {
  it('returns the requested number of weeks ending on today, Sunday-first, with counts filled in', () => {
    const today = new Date(2026, 8, 18); // Friday
    const weeks = heatmapWeeks([rec(2026, 9, 18), rec(2026, 9, 18), rec(2026, 9, 1)], 3, today);
    expect(weeks).toHaveLength(3);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0]![0]!.date.getDay()).toBe(0);
    const last = weeks[2]!;
    const fri = last[5]!;
    expect(fri.key).toBe('2026-09-18');
    expect(fri.count).toBe(2);
    expect(last[6]!.future).toBe(true);
    const sep1 = weeks.flat().find((c) => c.key === '2026-09-01');
    expect(sep1?.count).toBe(1);
  });
});
