import 'fake-indexeddb/auto';
import {
  addAnswer,
  getAllAnswers,
  getAnswersByQuestion,
  clearAnswers,
  getSettings,
  saveSettings,
  importAnswers,
  getApiKey,
  saveApiKey,
  getGeneratedQuestions,
  addGeneratedQuestions,
  deleteGeneratedQuestion,
  clearGeneratedQuestions,
} from './db';
import { DEFAULT_SETTINGS, type AnswerRecord, type Question } from '../types';

function rec(questionId: string, timestamp: string): Omit<AnswerRecord, 'id'> {
  return { questionId, timestamp, selectedChoice: 1, result: 'correct', answerTimeMs: 1234 };
}

function gq(id: string): Question {
  return {
    id,
    category: 'nonverbal',
    topic: 'probability',
    difficulty: 2,
    question: 'q',
    choices: ['a', 'b', 'c', 'd'],
    correctChoice: 1,
    recommendedTime: 60,
    explanation: 'x'.repeat(50),
    tags: [],
    source: 'ai',
    createdAt: '2026-09-18T00:00:00.000Z',
    generatedBy: 'claude-opus-5',
  };
}

beforeEach(async () => {
  await clearAnswers();
  await clearGeneratedQuestions();
  await saveSettings(DEFAULT_SETTINGS);
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
    expect(all.every((r) => r.id !== 99 && r.id !== 100)).toBe(true);
  });
});

describe('settings store', () => {
  it('fills defaults for missing fields', async () => {
    await saveSettings({ questionsPerDay: 10 } as never);
    expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, questionsPerDay: 10 });
  });
});

describe('api key store', () => {
  it('stores and clears the key', async () => {
    expect(await getApiKey()).toBe('');
    await saveApiKey('sk-ant-test');
    expect(await getApiKey()).toBe('sk-ant-test');
    await saveApiKey('');
    expect(await getApiKey()).toBe('');
  });
});

describe('generated questions store', () => {
  it('adds, lists, deletes and clears; duplicates by id are skipped', async () => {
    const added = await addGeneratedQuestions([gq('ai-probability-a'), gq('ai-probability-b')]);
    expect(added).toBe(2);
    expect(await addGeneratedQuestions([gq('ai-probability-a'), gq('ai-probability-c')])).toBe(1);
    const all = await getGeneratedQuestions();
    expect(all.map((q) => q.id).sort()).toEqual(['ai-probability-a', 'ai-probability-b', 'ai-probability-c']);
    await deleteGeneratedQuestion('ai-probability-b');
    expect((await getGeneratedQuestions()).map((q) => q.id).sort()).toEqual(['ai-probability-a', 'ai-probability-c']);
    await clearGeneratedQuestions();
    expect(await getGeneratedQuestions()).toHaveLength(0);
  });
});
