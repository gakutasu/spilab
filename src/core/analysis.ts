import type { AnswerRecord, Evaluation, Question } from '../types';
import { TOPICS, topicLabel, type TopicId } from '../questions/topics';
import { computeAllQuestionStats, computeTopicStats, sortRecords, type TopicStats } from './stats';
import { EVALUATION_LABEL } from './evaluation';
import { selectQuestions, bucketOf } from './selection';
import { mulberry32 } from './rng';

export type InsightKind = 'unlearned' | 'weak' | 'slow' | 'normal' | 'strong' | 'unrated';

export interface TopicInsight {
  topic: TopicId;
  label: string;
  kind: InsightKind;
  evaluation: Evaluation;
  score: number;
  message: string;
  stats: TopicStats;
}

const KIND_ORDER: Record<InsightKind, number> = { unlearned: 0, weak: 1, slow: 2, unrated: 3, normal: 4, strong: 5 };

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/** Rule-based reading of each answered topic, weakest first. */
export function analyzeTopics(questions: Question[], records: AnswerRecord[]): TopicInsight[] {
  const insights: TopicInsight[] = [];
  for (const s of computeTopicStats(questions, records).values()) {
    if (s.attemptCount === 0) continue;
    const label = topicLabel(s.topic);
    const timeRatio = s.averageRecommendedTimeMs > 0 ? s.averageAnswerTimeMs / s.averageRecommendedTimeMs : 0;
    let kind: InsightKind;
    let message: string;
    if (s.attemptCount >= 2 && s.unknownRate >= 0.3) {
      kind = 'unlearned';
      message = `「わからない」が${pct(s.unknownRate)}。解法そのものが未定着です。解説を読み直して型を覚えるのが先決。`;
    } else if (s.evaluation === 'weak') {
      kind = 'weak';
      message = `正答率${pct(s.correctRate)}。考え方はあるが間違えやすい状態。誤答のポイントを確認しましょう。`;
    } else if (s.evaluation !== 'unrated' && s.correctRate >= 0.7 && timeRatio > 1.5) {
      kind = 'slow';
      message = `正解できていますが目安時間の${timeRatio.toFixed(1)}倍。理解はOK、処理速度に改善余地。`;
    } else if (s.evaluation === 'unrated') {
      kind = 'unrated';
      message = `あと${Math.max(0, 3 - s.attemptCount)}回の回答で評価が確定します。`;
    } else if (s.evaluation === 'strong') {
      kind = 'strong';
      message = `正答率${pct(s.correctRate)}で安定。復習は少なめで十分です。`;
    } else {
      kind = 'normal';
      message = `正答率${pct(s.correctRate)}。もう少しで得意に届きます。`;
    }
    insights.push({ topic: s.topic, label, kind, evaluation: s.evaluation, score: s.score, message, stats: s });
  }
  return insights.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.score - b.score);
}

export interface Forecast {
  topics: Array<{ topic: TopicId; label: string; share: number; evaluation: Evaluation }>;
  buckets: Record<Evaluation, number>;
}

/** Simulates the real selection algorithm to estimate what the next session will emphasise. */
export function forecastNextSession(
  questions: Question[],
  records: AnswerRecord[],
  count: number,
  now: Date = new Date(),
  trials = 100,
  options: { formats?: Record<'testcenter' | 'paper', boolean>; includeEnglish?: boolean } = {},
): Forecast {
  const qStats = computeAllQuestionStats(questions, records);
  const topicStats = computeTopicStats(questions, records);
  const topicCounts = new Map<TopicId, number>();
  const buckets: Record<Evaluation, number> = { weak: 0, normal: 0, unrated: 0, strong: 0 };
  let total = 0;
  for (let seed = 0; seed < trials; seed++) {
    const picked = selectQuestions({ questions, records, count, now, rng: mulberry32(seed + 1), formats: options.formats, includeEnglish: options.includeEnglish });
    for (const q of picked) {
      topicCounts.set(q.topic, (topicCounts.get(q.topic) ?? 0) + 1);
      buckets[bucketOf(qStats.get(q.id)!, topicStats.get(q.topic)!.evaluation)] += 1;
      total += 1;
    }
  }
  if (total === 0) return { topics: [], buckets };
  const topics = [...topicCounts.entries()]
    .map(([topic, n]) => ({ topic, label: topicLabel(topic), share: n / total, evaluation: topicStats.get(topic)!.evaluation }))
    .sort((a, b) => b.share - a.share);
  for (const k of Object.keys(buckets) as Evaluation[]) buckets[k] /= total;
  return { topics, buckets };
}

export interface Trend {
  recentRate: number;
  previousRate: number;
  recentCount: number;
  previousCount: number;
}

/** Correct rate of the latest `window` answers vs the `window` before it. Null until both windows exist. */
export function recentTrend(records: AnswerRecord[], window = 10): Trend | null {
  const sorted = sortRecords(records);
  if (sorted.length < window * 2) return null;
  const recent = sorted.slice(-window);
  const previous = sorted.slice(-window * 2, -window);
  const rate = (rs: AnswerRecord[]) => rs.filter((r) => r.result === 'correct').length / rs.length;
  return { recentRate: rate(recent), previousRate: rate(previous), recentCount: recent.length, previousCount: previous.length };
}

export function evaluationLabel(e: Evaluation): string {
  return EVALUATION_LABEL[e];
}

export function categoryOf(topic: TopicId) {
  return TOPICS[topic].category;
}
