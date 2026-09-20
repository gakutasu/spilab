import type { AnswerRecord, AnswerResult, Category, Evaluation, Question } from '../types';
import { TOPIC_IDS, TOPICS, type TopicId } from '../questions/topics';
import { computeMastery, INITIAL_MASTERY } from './mastery';
import { evaluate } from './evaluation';

export interface QuestionStats {
  questionId: string;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  unknownCount: number;
  correctRate: number;
  averageAnswerTimeMs: number;
  lastAnsweredAt: string | null;
  lastResult: AnswerResult | null;
  lastAnswerTimeMs: number | null;
  /** Trailing run of correct answers. */
  consecutiveCorrect: number;
  /** Trailing run of incorrect or unknown answers. */
  consecutiveMisses: number;
  masteryScore: number;
  evaluation: Evaluation;
}

export interface TopicStats {
  topic: TopicId;
  category: Category;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  unknownCount: number;
  correctRate: number;
  unknownRate: number;
  averageAnswerTimeMs: number;
  averageRecommendedTimeMs: number;
  score: number;
  evaluation: Evaluation;
  /** Number of questions in the bank for this topic. */
  questionCount: number;
  /** Distinct questions answered at least once. */
  answeredQuestionCount: number;
}

export interface OverallStats {
  questionCount: number;
  answeredQuestionCount: number;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  unknownCount: number;
  correctRate: number;
  unknownRate: number;
  averageAnswerTimeMs: number;
  studyDays: number;
}

export function sortRecords(records: AnswerRecord[]): AnswerRecord[] {
  return [...records].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
}

export function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface Counts {
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  unknownCount: number;
  totalAnswerTimeMs: number;
}

function countResults(records: AnswerRecord[]): Counts {
  const c: Counts = { attemptCount: 0, correctCount: 0, incorrectCount: 0, unknownCount: 0, totalAnswerTimeMs: 0 };
  for (const r of records) {
    c.attemptCount += 1;
    c.totalAnswerTimeMs += r.answerTimeMs;
    if (r.result === 'correct') c.correctCount += 1;
    else if (r.result === 'incorrect') c.incorrectCount += 1;
    else c.unknownCount += 1;
  }
  return c;
}

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

function trailingRun(records: AnswerRecord[], predicate: (r: AnswerResult) => boolean): number {
  let n = 0;
  for (let i = records.length - 1; i >= 0; i--) {
    if (!predicate(records[i]!.result)) break;
    n += 1;
  }
  return n;
}

export function computeQuestionStats(question: Question, records: AnswerRecord[]): QuestionStats {
  const own = sortRecords(records.filter((r) => r.questionId === question.id));
  const c = countResults(own);
  const last = own[own.length - 1];
  const masteryScore = own.length
    ? computeMastery(own.map((r) => ({ result: r.result, answerTimeMs: r.answerTimeMs, recommendedTime: question.recommendedTime })))
    : INITIAL_MASTERY;
  return {
    questionId: question.id,
    attemptCount: c.attemptCount,
    correctCount: c.correctCount,
    incorrectCount: c.incorrectCount,
    unknownCount: c.unknownCount,
    correctRate: ratio(c.correctCount, c.attemptCount),
    averageAnswerTimeMs: ratio(c.totalAnswerTimeMs, c.attemptCount),
    lastAnsweredAt: last ? last.timestamp : null,
    lastResult: last ? last.result : null,
    lastAnswerTimeMs: last ? last.answerTimeMs : null,
    consecutiveCorrect: trailingRun(own, (r) => r === 'correct'),
    consecutiveMisses: trailingRun(own, (r) => r !== 'correct'),
    masteryScore,
    evaluation: evaluate(masteryScore, c.attemptCount),
  };
}

function groupByQuestion(records: AnswerRecord[]): Map<string, AnswerRecord[]> {
  const map = new Map<string, AnswerRecord[]>();
  for (const r of records) {
    const list = map.get(r.questionId);
    if (list) list.push(r);
    else map.set(r.questionId, [r]);
  }
  return map;
}

export function computeAllQuestionStats(questions: Question[], records: AnswerRecord[]): Map<string, QuestionStats> {
  const grouped = groupByQuestion(records);
  const result = new Map<string, QuestionStats>();
  for (const q of questions) {
    result.set(q.id, computeQuestionStats(q, grouped.get(q.id) ?? []));
  }
  return result;
}

/** Records whose question no longer exists are dropped. */
function joinWithQuestions(questions: Question[], records: AnswerRecord[]): Array<{ record: AnswerRecord; question: Question }> {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const joined: Array<{ record: AnswerRecord; question: Question }> = [];
  for (const record of sortRecords(records)) {
    const question = byId.get(record.questionId);
    if (question) joined.push({ record, question });
  }
  return joined;
}

export function computeTopicStats(questions: Question[], records: AnswerRecord[]): Map<TopicId, TopicStats> {
  const joined = joinWithQuestions(questions, records);
  const byTopic = new Map<TopicId, Array<{ record: AnswerRecord; question: Question }>>();
  for (const item of joined) {
    const list = byTopic.get(item.question.topic);
    if (list) list.push(item);
    else byTopic.set(item.question.topic, [item]);
  }

  const result = new Map<TopicId, TopicStats>();
  for (const topic of TOPIC_IDS) {
    const items = byTopic.get(topic) ?? [];
    const c = countResults(items.map((i) => i.record));
    const totalRecommendedMs = items.reduce((sum, i) => sum + i.question.recommendedTime * 1000, 0);
    const score = computeMastery(
      items.map((i) => ({ result: i.record.result, answerTimeMs: i.record.answerTimeMs, recommendedTime: i.question.recommendedTime })),
    );
    result.set(topic, {
      topic,
      category: TOPICS[topic].category,
      questionCount: questions.filter((q) => q.topic === topic).length,
      answeredQuestionCount: new Set(items.map((i) => i.question.id)).size,
      attemptCount: c.attemptCount,
      correctCount: c.correctCount,
      incorrectCount: c.incorrectCount,
      unknownCount: c.unknownCount,
      correctRate: ratio(c.correctCount, c.attemptCount),
      unknownRate: ratio(c.unknownCount, c.attemptCount),
      averageAnswerTimeMs: ratio(c.totalAnswerTimeMs, c.attemptCount),
      averageRecommendedTimeMs: ratio(totalRecommendedMs, c.attemptCount),
      score,
      evaluation: evaluate(score, c.attemptCount),
    });
  }
  return result;
}

export function computeOverallStats(questions: Question[], records: AnswerRecord[]): OverallStats {
  const joined = joinWithQuestions(questions, records);
  const own = joined.map((i) => i.record);
  const c = countResults(own);
  const days = new Set(own.map((r) => localDateKey(r.timestamp)));
  return {
    questionCount: questions.length,
    answeredQuestionCount: new Set(own.map((r) => r.questionId)).size,
    attemptCount: c.attemptCount,
    correctCount: c.correctCount,
    incorrectCount: c.incorrectCount,
    unknownCount: c.unknownCount,
    correctRate: ratio(c.correctCount, c.attemptCount),
    unknownRate: ratio(c.unknownCount, c.attemptCount),
    averageAnswerTimeMs: ratio(c.totalAnswerTimeMs, c.attemptCount),
    studyDays: days.size,
  };
}
