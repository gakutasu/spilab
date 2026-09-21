import type { AnswerRecord, Question } from '../types';
import type { TopicId } from '../questions/topics';
import { mulberry32 } from './rng';
import { categorySplit, isInCooldown, bucketOf, priorityWeight, selectQuestions } from './selection';
import { computeQuestionStats, type QuestionStats } from './stats';

function makeQuestion(id: string, topic: TopicId, category: Question['category']): Question {
  return {
    id,
    category,
    topic,
    difficulty: 1,
    question: 'q',
    choices: ['a', 'b', 'c', 'd'],
    correctChoice: 0,
    recommendedTime: 30,
    explanation: 'x'.repeat(50),
    tags: [],
  };
}

function rec(questionId: string, timestamp: string, result: AnswerRecord['result'], answerTimeMs = 10000): AnswerRecord {
  return { questionId, timestamp, result, answerTimeMs, selectedChoice: result === 'unknown' ? null : 0 };
}

const NOW = new Date('2026-09-18T12:00:00.000Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86400000).toISOString();

const verbal = [1, 2, 3, 4].map((i) => makeQuestion(`v${i}`, 'word_relation', 'verbal'));
const perm = [1, 2, 3, 4].map((i) => makeQuestion(`p${i}`, 'permutation', 'nonverbal'));
const profit = [1, 2, 3, 4].map((i) => makeQuestion(`l${i}`, 'profit_loss', 'nonverbal'));
const all = [...verbal, ...perm, ...profit];

describe('categorySplit', () => {
  it('splits 7 into 3/4 or 4/3 depending on rng', () => {
    const a = categorySplit(7, () => 0.1);
    const b = categorySplit(7, () => 0.9);
    expect([a.verbal, a.nonverbal].sort()).toEqual([3, 4]);
    expect([b.verbal, b.nonverbal].sort()).toEqual([3, 4]);
    expect(a.verbal).not.toBe(b.verbal);
    expect(a.english).toBe(0);
  });

  it('splits even counts evenly', () => {
    expect(categorySplit(10, () => 0.5)).toEqual({ verbal: 5, nonverbal: 5, english: 0 });
  });

  it('reserves about a sixth for English when enabled', () => {
    expect(categorySplit(7, () => 0.5, true)).toEqual({ verbal: 3, nonverbal: 3, english: 1 });
    expect(categorySplit(15, () => 0.5, true).english).toBe(3);
  });
});

describe('isInCooldown', () => {
  const q = perm[0]!;
  it('is false when never answered', () => {
    expect(isInCooldown(computeQuestionStats(q, []), NOW)).toBe(false);
  });

  it('uses a 3-day cooldown after a correct answer', () => {
    expect(isInCooldown(computeQuestionStats(q, [rec(q.id, daysAgo(2), 'correct')]), NOW)).toBe(true);
    expect(isInCooldown(computeQuestionStats(q, [rec(q.id, daysAgo(3.1), 'correct')]), NOW)).toBe(false);
  });

  it('uses a 1-day cooldown after unknown or repeated misses', () => {
    expect(isInCooldown(computeQuestionStats(q, [rec(q.id, daysAgo(0.5), 'unknown')]), NOW)).toBe(true);
    expect(isInCooldown(computeQuestionStats(q, [rec(q.id, daysAgo(1.5), 'unknown')]), NOW)).toBe(false);
    const twoMisses = [rec(q.id, daysAgo(5), 'incorrect'), rec(q.id, daysAgo(1.5), 'incorrect')];
    expect(isInCooldown(computeQuestionStats(q, twoMisses), NOW)).toBe(false);
    const oneMiss = [rec(q.id, daysAgo(5), 'correct'), rec(q.id, daysAgo(1.5), 'incorrect')];
    expect(isInCooldown(computeQuestionStats(q, oneMiss), NOW)).toBe(true);
  });
});

describe('bucketOf / priorityWeight', () => {
  const q = perm[0]!;
  it('puts never-answered questions in unrated regardless of topic', () => {
    expect(bucketOf(computeQuestionStats(q, []), 'weak')).toBe('unrated');
    expect(bucketOf(computeQuestionStats(q, [rec(q.id, daysAgo(9), 'correct')]), 'weak')).toBe('weak');
  });

  it('weights unknown > incorrect > slow correct > plain', () => {
    const plain: QuestionStats = computeQuestionStats(q, [rec(q.id, daysAgo(9), 'correct', 10000)]);
    const slow = computeQuestionStats(q, [rec(q.id, daysAgo(9), 'correct', 60000)]);
    const wrong = computeQuestionStats(q, [rec(q.id, daysAgo(9), 'incorrect')]);
    const unknown = computeQuestionStats(q, [rec(q.id, daysAgo(9), 'unknown')]);
    expect(priorityWeight(plain, q)).toBe(1);
    expect(priorityWeight(slow, q)).toBe(2);
    expect(priorityWeight(wrong, q)).toBe(3);
    expect(priorityWeight(unknown, q)).toBe(4);
  });
});

describe('selectQuestions', () => {
  it('returns the requested count with no duplicates and both categories', () => {
    const picked = selectQuestions({ questions: all, records: [], count: 7, now: NOW, rng: mulberry32(1) });
    expect(picked).toHaveLength(7);
    expect(new Set(picked.map((q) => q.id)).size).toBe(7);
    const verbalCount = picked.filter((q) => q.category === 'verbal').length;
    expect([3, 4]).toContain(verbalCount);
  });

  it('caps at available questions when the bank is small', () => {
    const picked = selectQuestions({ questions: all.slice(0, 2), records: [], count: 7, now: NOW, rng: mulberry32(1) });
    expect(picked).toHaveLength(2);
  });

  it('avoids questions in cooldown when alternatives exist', () => {
    const records = [rec('v1', daysAgo(1), 'correct')];
    for (let seed = 0; seed < 50; seed++) {
      const picked = selectQuestions({ questions: all, records, count: 4, now: NOW, rng: mulberry32(seed) });
      expect(picked.map((q) => q.id)).not.toContain('v1');
    }
  });

  it('relaxes cooldown when there are not enough alternatives', () => {
    const records = verbal.map((q) => rec(q.id, daysAgo(1), 'correct'));
    const picked = selectQuestions({ questions: all, records, count: 8, now: NOW, rng: mulberry32(3) });
    expect(picked.filter((q) => q.category === 'verbal')).toHaveLength(4);
  });

  it('prefers weak topics over strong ones', () => {
    const records: AnswerRecord[] = [];
    for (const q of perm) records.push(rec(q.id, daysAgo(10), 'unknown'), rec(q.id, daysAgo(9), 'incorrect'), rec(q.id, daysAgo(8), 'unknown'));
    for (const q of profit) records.push(rec(q.id, daysAgo(10), 'correct'), rec(q.id, daysAgo(9), 'correct'), rec(q.id, daysAgo(8), 'correct'));
    let permCount = 0;
    let profitCount = 0;
    for (let seed = 0; seed < 300; seed++) {
      const picked = selectQuestions({ questions: all, records, count: 3, now: NOW, rng: mulberry32(seed) });
      for (const q of picked) {
        if (q.topic === 'permutation') permCount++;
        if (q.topic === 'profit_loss') profitCount++;
      }
    }
    expect(permCount).toBeGreaterThan(profitCount * 2);
  });

  it('spreads a session across topics when the bank allows it', () => {
    const topics: TopicId[] = ['vocabulary', 'idiom', 'word_meaning', 'reading', 'ratio', 'speed', 'work_rate', 'set'];
    const bank = topics.flatMap((t, ti) =>
      [1, 2, 3, 4, 5].map((i) => makeQuestion(`${t}${i}`, t, ti < 4 ? 'verbal' : 'nonverbal')),
    );
    let distinctTotal = 0;
    for (let seed = 0; seed < 100; seed++) {
      const picked = selectQuestions({ questions: bank, records: [], count: 7, now: NOW, rng: mulberry32(seed) });
      distinctTotal += new Set(picked.map((q) => q.topic)).size;
    }
    expect(distinctTotal / 100).toBeGreaterThan(6.3);
  });

  it('draws from topics that were never attempted before anything else', () => {
    // verbal: word_relation attempted, vocabulary untouched; nonverbal: permutation attempted, profit_loss untouched
    const vocab = [1, 2, 3].map((i) => makeQuestion(`vo${i}`, 'vocabulary', 'verbal'));
    const bank = [...verbal, ...vocab, ...perm, ...profit];
    const records = [rec('v1', daysAgo(10), 'correct'), rec('p1', daysAgo(10), 'unknown')];
    for (let seed = 0; seed < 30; seed++) {
      const picked = selectQuestions({ questions: bank, records, count: 2, now: NOW, rng: mulberry32(seed) });
      const topics = picked.map((q) => q.topic);
      expect(topics).toContain('vocabulary');
      expect(topics).toContain('profit_loss');
    }
  });

  it('excludes paper-only and English topics unless enabled', () => {
    const paperQ = [1, 2].map((i) => makeQuestion(`fr${i}`, 'flow_ratio', 'nonverbal'));
    const engQ = [1, 2].map((i) => makeQuestion(`en${i}`, 'eng_synonym', 'english'));
    const bank = [...verbal, ...perm, ...paperQ, ...engQ];
    const base = { questions: bank, records: [], count: 8, now: NOW };
    const tcOnly = selectQuestions({ ...base, rng: mulberry32(1) }).map((q) => q.topic);
    expect(tcOnly).not.toContain('flow_ratio');
    expect(tcOnly).not.toContain('eng_synonym');
    const withPaper = selectQuestions({ ...base, rng: mulberry32(1), formats: { testcenter: true, paper: true } }).map((q) => q.topic);
    expect(withPaper).toContain('flow_ratio');
    const withEnglish = selectQuestions({ ...base, rng: mulberry32(1), includeEnglish: true }).map((q) => q.topic);
    expect(withEnglish).toContain('eng_synonym');
  });

  it('restricts to a category or a topic when scoped', () => {
    const engQ = [1, 2, 3].map((i) => makeQuestion(`en${i}`, 'eng_synonym', 'english'));
    const bank = [...verbal, ...perm, ...profit, ...engQ];
    const base = { questions: bank, records: [], count: 5, now: NOW };
    const cat = selectQuestions({ ...base, rng: mulberry32(2), scope: { kind: 'category', category: 'nonverbal' } });
    expect(cat).toHaveLength(5);
    expect(cat.every((q) => q.category === 'nonverbal')).toBe(true);
    const topic = selectQuestions({ ...base, rng: mulberry32(2), scope: { kind: 'topic', topic: 'permutation' } });
    expect(topic).toHaveLength(4);
    expect(topic.every((q) => q.topic === 'permutation')).toBe(true);
    // English scope works even when the English toggle is off
    const eng = selectQuestions({ ...base, rng: mulberry32(2), scope: { kind: 'category', category: 'english' }, includeEnglish: false });
    expect(eng).toHaveLength(3);
  });

  it('is deterministic for a given seed', () => {
    const a = selectQuestions({ questions: all, records: [], count: 5, now: NOW, rng: mulberry32(42) });
    const b = selectQuestions({ questions: all, records: [], count: 5, now: NOW, rng: mulberry32(42) });
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});
