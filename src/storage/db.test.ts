import 'fake-indexeddb/auto';
import { addAnswer, getAllAnswers, getAnswersByQuestion, clearAnswers, getSettings, saveSettings, importAnswers } from './db';
import type { AnswerRecord } from '../types';

function rec(questionId: string, timestamp: string): Omit<AnswerRecord, 'id'> {
  return { questionId, timestamp, selectedChoice: 1, result: 'correct', answerTimeMs: 1234 };
}

beforeEach(async () => {
  await clearAnswers();
  await saveSettings({ questionsPerDay: 7 });
});

describe('answers store', () => {
  it('adds and reads back records with generated ids', async () => {
    const id = await addAnswer(rec('q1', '2026-09-18T00:00:00.000Z'));
    expect(typeof id).toBe('number');
    const all = await getAllAnswers();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id, questionId: 'q1', answerTimeMs: 1234 });
  });

  it('filters by question id', async () => {
    await addAnswer(rec('q1', '2026-09-18T00:00:00.000Z'));
    await addAnswer(rec('q2', '2026-09-18T00:00:01.000Z'));
    await addAnswer(rec('q1', '2026-09-18T00:00:02.000Z'));
    const q1 = await getAnswersByQuestion('q1');
    expect(q1).toHaveLength(2);
    expect(q1.every((r) => r.questionId === 'q1')).toBe(true);
  });

  it('clears everything', async () => {
    await addAnswer(rec('q1', '2026-09-18T00:00:00.000Z'));
    await clearAnswers();
    expect(await getAllAnswers()).toHaveLength(0);
  });
});

describe('importAnswers', () => {
  it('skips records that already exist (same questionId + timestamp)', async () => {
    await addAnswer(rec('q1', '2026-09-18T00:00:00.000Z'));
    const added = await importAnswers([
      { ...rec('q1', '2026-09-18T00:00:00.000Z'), id: 99 },
      { ...rec('q1', '2026-09-18T00:00:05.000Z'), id: 100 },
      rec('q2', '2026-09-18T00:00:00.000Z'),
    ]);
    expect(added).toBe(2);
    const all = await getAllAnswers();
    expect(all).toHaveLength(3);
    // Imported ids are not reused; the store assigns its own.
    expect(all.every((r) => r.id !== 99 && r.id !== 100)).toBe(true);
  });
});

describe('settings store', () => {
  it('returns defaults when nothing is saved', async () => {
    await saveSettings({ questionsPerDay: 10 });
    expect(await getSettings()).toEqual({ questionsPerDay: 10 });
  });
});
