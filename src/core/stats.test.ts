import type { AnswerRecord, Question } from '../types';
import {
  sortRecords,
  computeQuestionStats,
  computeAllQuestionStats,
  computeTopicStats,
  computeOverallStats,
  localDateKey,
} from './stats';

function makeQuestion(id: string, topic: Question['topic'], recommendedTime: number): Question {
  return {
    id,
    category: topic === 'word_relation' ? 'verbal' : 'nonverbal',
    topic,
    difficulty: 1,
    question: 'q',
    choices: ['a', 'b', 'c', 'd'],
    correctChoice: 0,
    recommendedTime,
    explanation: 'x'.repeat(50),
    tags: [],
  };
}

function rec(
  questionId: string,
  timestamp: string,
  result: AnswerRecord['result'],
  answerTimeMs: number,
): AnswerRecord {
  return { questionId, timestamp, result, answerTimeMs, selectedChoice: result === 'unknown' ? null : 0 };
}

const q1 = makeQuestion('q1', 'permutation', 30);
const q2 = makeQuestion('q2', 'permutation', 60);
const q3 = makeQuestion('q3', 'word_relation', 20);
const questions = [q1, q2, q3];

const T1 = '2026-09-15T10:00:00.000Z';
const T2 = '2026-09-16T10:00:00.000Z';
const T3 = '2026-09-17T10:00:00.000Z';

describe('sortRecords', () => {
  it('sorts by timestamp ascending without mutating input', () => {
    const input = [rec('q1', T3, 'correct', 1), rec('q1', T1, 'correct', 1), rec('q1', T2, 'correct', 1)];
    const sorted = sortRecords(input);
    expect(sorted.map((r) => r.timestamp)).toEqual([T1, T2, T3]);
    expect(input[0]!.timestamp).toBe(T3);
  });
});

describe('computeQuestionStats', () => {
  it('returns defaults with no records', () => {
    const s = computeQuestionStats(q1, []);
    expect(s).toMatchObject({
      questionId: 'q1',
      attemptCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      unknownCount: 0,
      correctRate: 0,
      averageAnswerTimeMs: 0,
      lastAnsweredAt: null,
      lastResult: null,
      consecutiveCorrect: 0,
      consecutiveMisses: 0,
      masteryScore: 50,
      evaluation: 'unrated',
    });
  });

  it('aggregates counts, averages, streaks and mastery in chronological order', () => {
    const records = [
      rec('q1', T3, 'unknown', 20000),
      rec('q1', T1, 'correct', 20000),
      rec('q1', T2, 'incorrect', 20000),
      rec('q2', T1, 'correct', 1000), // other question, ignored
    ];
    const s = computeQuestionStats(q1, records);
    expect(s.attemptCount).toBe(3);
    expect(s.correctCount).toBe(1);
    expect(s.incorrectCount).toBe(1);
    expect(s.unknownCount).toBe(1);
    expect(s.correctRate).toBeCloseTo(1 / 3);
    expect(s.averageAnswerTimeMs).toBe(20000);
    expect(s.lastAnsweredAt).toBe(T3);
    expect(s.lastResult).toBe('unknown');
    expect(s.consecutiveCorrect).toBe(0);
    expect(s.consecutiveMisses).toBe(2);
    expect(s.masteryScore).toBe(41); // 50 + 8 - 7 - 10
    expect(s.evaluation).toBe('weak');
  });

  it('counts trailing correct streak', () => {
    const records = [rec('q1', T1, 'incorrect', 1000), rec('q1', T2, 'correct', 1000), rec('q1', T3, 'correct', 1000)];
    const s = computeQuestionStats(q1, records);
    expect(s.consecutiveCorrect).toBe(2);
    expect(s.consecutiveMisses).toBe(0);
  });
});

describe('computeAllQuestionStats', () => {
  it('returns stats for every question and ignores unknown question ids', () => {
    const records = [rec('ghost', T1, 'correct', 1000), rec('q3', T1, 'correct', 5000)];
    const map = computeAllQuestionStats(questions, records);
    expect(map.size).toBe(3);
    expect(map.get('q3')!.attemptCount).toBe(1);
    expect(map.get('q1')!.attemptCount).toBe(0);
    expect(map.has('ghost')).toBe(false);
  });
});

describe('computeTopicStats', () => {
  it('aggregates per topic including recommended time and unknown rate', () => {
    const records = [rec('q1', T1, 'correct', 20000), rec('q2', T2, 'unknown', 30000)];
    const map = computeTopicStats(questions, records);
    const p = map.get('permutation')!;
    expect(p.category).toBe('nonverbal');
    expect(p.attemptCount).toBe(2);
    expect(p.correctCount).toBe(1);
    expect(p.unknownCount).toBe(1);
    expect(p.correctRate).toBe(0.5);
    expect(p.unknownRate).toBe(0.5);
    expect(p.averageAnswerTimeMs).toBe(25000);
    expect(p.averageRecommendedTimeMs).toBe(45000);
    expect(p.score).toBe(48); // 50 + 8 - 10
    expect(p.evaluation).toBe('unrated');
    expect(p.questionCount).toBe(2);
    expect(p.answeredQuestionCount).toBe(2);
    // topics with no records are still present
    expect(map.get('probability')!.attemptCount).toBe(0);
    expect(map.get('probability')!.evaluation).toBe('unrated');
  });

  it('becomes strong after enough fast correct answers', () => {
    const records = [T1, T2, T3, '2026-09-18T10:00:00.000Z'].map((t) => rec('q1', t, 'correct', 10000));
    const p = computeTopicStats(questions, records).get('permutation')!;
    expect(p.score).toBe(82);
    expect(p.evaluation).toBe('strong');
  });
});

describe('computeOverallStats', () => {
  it('computes totals, rates and distinct study days', () => {
    const sameDayA = new Date(2026, 8, 17, 9, 0).toISOString();
    const sameDayB = new Date(2026, 8, 17, 22, 0).toISOString();
    const otherDay = new Date(2026, 8, 18, 9, 0).toISOString();
    const records = [
      rec('q1', sameDayA, 'correct', 10000),
      rec('q2', sameDayB, 'unknown', 20000),
      rec('q3', otherDay, 'incorrect', 30000),
      rec('ghost', otherDay, 'correct', 1),
    ];
    const o = computeOverallStats(questions, records);
    expect(o.attemptCount).toBe(3);
    expect(o.correctCount).toBe(1);
    expect(o.correctRate).toBeCloseTo(1 / 3);
    expect(o.unknownRate).toBeCloseTo(1 / 3);
    expect(o.averageAnswerTimeMs).toBe(20000);
    expect(o.studyDays).toBe(2);
  });

  it('returns zeros with no records', () => {
    expect(computeOverallStats(questions, [])).toEqual({
      questionCount: 3,
      answeredQuestionCount: 0,
      attemptCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      unknownCount: 0,
      correctRate: 0,
      unknownRate: 0,
      averageAnswerTimeMs: 0,
      studyDays: 0,
    });
  });
});

describe('localDateKey', () => {
  it('formats local date as YYYY-MM-DD', () => {
    const iso = new Date(2026, 0, 5, 23, 30).toISOString();
    expect(localDateKey(iso)).toBe('2026-01-05');
  });
});
