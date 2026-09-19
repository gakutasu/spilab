import { toAnswerRow, fromAnswerRow, toSettingsRow, fromSettingsRow, nextWatermark, chunk } from './sync';
import { DEFAULT_SETTINGS } from '../types';

describe('answer row mapping', () => {
  const record = { id: 5, questionId: 'q1', timestamp: '2026-09-18T01:02:03.000Z', selectedChoice: null, result: 'unknown' as const, answerTimeMs: 1234 };

  it('maps to a row without the local id', () => {
    expect(toAnswerRow('u1', record)).toEqual({
      user_id: 'u1',
      question_id: 'q1',
      answered_at: '2026-09-18T01:02:03.000Z',
      selected_choice: null,
      result: 'unknown',
      answer_time_ms: 1234,
    });
  });

  it('round-trips and normalises timestamps to ISO', () => {
    const row = { ...toAnswerRow('u1', record), answered_at: '2026-09-18T01:02:03+00:00', created_at: 'x' };
    expect(fromAnswerRow(row)).toEqual({ questionId: 'q1', timestamp: '2026-09-18T01:02:03.000Z', selectedChoice: null, result: 'unknown', answerTimeMs: 1234 });
  });
});

describe('settings row mapping', () => {
  it('round-trips and fills defaults', () => {
    const row = toSettingsRow('u1', { ...DEFAULT_SETTINGS, questionsPerDay: 10 });
    expect(fromSettingsRow(row)).toEqual({ questionsPerDay: 10 });
    expect(fromSettingsRow({})).toEqual({ questionsPerDay: DEFAULT_SETTINGS.questionsPerDay });
  });
});

describe('nextWatermark', () => {
  it('keeps the previous value when nothing was pulled', () => {
    expect(nextWatermark('2026-01-01T00:00:00Z', [])).toBe('2026-01-01T00:00:00Z');
    expect(nextWatermark(null, [])).toBeNull();
  });

  it('advances to the newest created_at', () => {
    expect(nextWatermark('2026-01-01T00:00:00Z', [{ created_at: '2026-01-03T00:00:00Z' }, { created_at: '2026-01-02T00:00:00Z' }])).toBe(
      '2026-01-03T00:00:00Z',
    );
  });
});

describe('chunk', () => {
  it('splits into fixed-size parts', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 2)).toEqual([]);
  });
});
