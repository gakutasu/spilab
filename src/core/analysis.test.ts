import type { AnswerRecord, Question } from '../types';
import type { TopicId } from '../questions/topics';
import { analyzeTopics, forecastNextSession, recentTrend } from './analysis';

function q(id: string, topic: TopicId, category: Question['category'], recommendedTime = 30): Question {
  return { id, category, topic, difficulty: 1, question: 'q', choices: ['a', 'b', 'c', 'd'], correctChoice: 0, recommendedTime, explanation: 'x'.repeat(50), tags: [] };
}
function rec(questionId: string, day: number, result: AnswerRecord['result'], answerTimeMs = 10000): AnswerRecord {
  return { questionId, timestamp: new Date(Date.UTC(2026, 8, day, 10)).toISOString(), result, answerTimeMs, selectedChoice: result === 'unknown' ? null : 0 };
}

const bank: Question[] = [
  ...[1, 2, 3, 4].map((i) => q(`p${i}`, 'probability', 'nonverbal')),
  ...[1, 2, 3, 4].map((i) => q(`m${i}`, 'permutation', 'nonverbal')),
  ...[1, 2, 3, 4].map((i) => q(`l${i}`, 'profit_loss', 'nonverbal')),
  ...[1, 2, 3, 4].map((i) => q(`w${i}`, 'word_relation', 'verbal')),
  ...[1, 2, 3, 4].map((i) => q(`v${i}`, 'vocabulary', 'verbal')),
];

describe('analyzeTopics', () => {
  it('flags unknown-heavy topics as unlearned and slow-correct topics as speed issues', () => {
    const records = [
      rec('p1', 1, 'unknown'), rec('p2', 2, 'unknown'), rec('p3', 3, 'incorrect'),
      rec('m1', 1, 'correct', 60000), rec('m2', 2, 'correct', 55000), rec('m3', 3, 'correct', 50000),
      rec('l1', 1, 'correct'), rec('l2', 2, 'correct'), rec('l3', 3, 'correct'), rec('l4', 4, 'correct'),
      rec('w1', 1, 'correct'),
    ];
    const insights = analyzeTopics(bank, records);
    const byTopic = new Map(insights.map((i) => [i.topic, i]));
    expect(byTopic.get('probability')?.kind).toBe('unlearned');
    expect(byTopic.get('permutation')?.kind).toBe('slow');
    expect(byTopic.get('profit_loss')?.kind).toBe('strong');
    expect(byTopic.get('word_relation')?.kind).toBe('unrated');
    expect(byTopic.has('vocabulary')).toBe(false);
    // weakest first
    expect(insights[0]?.topic).toBe('probability');
    expect(insights.every((i) => i.message.length > 0)).toBe(true);
  });
});

describe('forecastNextSession', () => {
  it('gives weak topics a larger share and sums to about 100%', () => {
    const records: AnswerRecord[] = [];
    for (const id of ['p1', 'p2', 'p3', 'p4']) records.push(rec(id, 1, 'unknown'), rec(id, 2, 'incorrect'), rec(id, 3, 'unknown'));
    for (const id of ['l1', 'l2', 'l3', 'l4']) records.push(rec(id, 1, 'correct'), rec(id, 2, 'correct'), rec(id, 3, 'correct'));
    const f = forecastNextSession(bank, records, 7, new Date('2026-09-20T00:00:00Z'), 60);
    const share = new Map(f.topics.map((t) => [t.topic, t.share]));
    expect(share.get('probability')!).toBeGreaterThan(share.get('profit_loss')!);
    const total = f.topics.reduce((s, t) => s + t.share, 0);
    expect(total).toBeGreaterThan(0.99);
    expect(total).toBeLessThan(1.01);
    expect(f.buckets.weak + f.buckets.normal + f.buckets.unrated + f.buckets.strong).toBeCloseTo(1, 5);
  });
});

describe('recentTrend', () => {
  it('compares the latest window with the previous one', () => {
    const records = [
      ...[1, 2, 3, 4, 5].map((d) => rec('p1', d, 'incorrect')),
      ...[6, 7, 8, 9, 10].map((d) => rec('p1', d, 'correct')),
    ];
    const t = recentTrend(records, 5);
    expect(t).toEqual({ recentRate: 1, previousRate: 0, recentCount: 5, previousCount: 5 });
    expect(recentTrend(records.slice(0, 3), 5)).toBeNull();
  });
});
