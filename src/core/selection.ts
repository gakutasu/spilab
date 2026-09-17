import type { AnswerRecord, Category, Evaluation, Question } from '../types';
import type { TopicId } from '../questions/topics';
import { computeAllQuestionStats, computeTopicStats, type QuestionStats } from './stats';
import { timeBand, timeRatio } from './timeRatio';
import { shuffle, weightedIndex, type Rng } from './rng';

const DAY_MS = 86400000;
export const COOLDOWN_DAYS = 3;
export const SHORT_COOLDOWN_DAYS = 1;

/** Target share of each bucket in a daily set. */
export const BUCKET_WEIGHTS: Record<Evaluation, number> = {
  weak: 40,
  normal: 30,
  unrated: 20,
  strong: 10,
};

export interface SelectionInput {
  questions: Question[];
  records: AnswerRecord[];
  count: number;
  now: Date;
  rng: Rng;
}

export function categorySplit(count: number, rng: Rng): Record<Category, number> {
  const small = Math.floor(count / 2);
  const large = count - small;
  return rng() < 0.5 ? { verbal: small, nonverbal: large } : { verbal: large, nonverbal: small };
}

export function isInCooldown(stats: QuestionStats, now: Date): boolean {
  if (!stats.lastAnsweredAt) return false;
  const elapsedDays = (now.getTime() - new Date(stats.lastAnsweredAt).getTime()) / DAY_MS;
  const short = stats.lastResult === 'unknown' || stats.consecutiveMisses >= 2;
  return elapsedDays < (short ? SHORT_COOLDOWN_DAYS : COOLDOWN_DAYS);
}

export function bucketOf(stats: QuestionStats, topicEvaluation: Evaluation): Evaluation {
  return stats.attemptCount === 0 ? 'unrated' : topicEvaluation;
}

/** Higher for questions that were unknown, wrong, or answered slowly. */
export function priorityWeight(stats: QuestionStats, question: Question): number {
  let w = 1 + stats.unknownCount * 3 + stats.incorrectCount * 2;
  if (stats.lastResult === 'correct' && stats.lastAnswerTimeMs !== null) {
    if (timeBand(timeRatio(stats.lastAnswerTimeMs, question.recommendedTime)) === 'very_slow') w += 1;
  }
  return w;
}

interface Candidate {
  question: Question;
  stats: QuestionStats;
  bucket: Evaluation;
}

function drawFromBuckets(candidates: Candidate[], need: number, rng: Rng): Question[] {
  const buckets = new Map<Evaluation, Candidate[]>();
  for (const c of candidates) {
    const list = buckets.get(c.bucket);
    if (list) list.push(c);
    else buckets.set(c.bucket, [c]);
  }

  const picked: Question[] = [];
  while (picked.length < need) {
    const keys = [...buckets.keys()].filter((k) => (buckets.get(k)?.length ?? 0) > 0);
    if (keys.length === 0) break;
    const bucketKey = keys[weightedIndex(keys.map((k) => BUCKET_WEIGHTS[k]), rng)]!;
    const list = buckets.get(bucketKey)!;
    const idx = weightedIndex(list.map((c) => priorityWeight(c.stats, c.question)), rng);
    picked.push(list[idx]!.question);
    list.splice(idx, 1);
  }
  return picked;
}

function selectForCategory(
  category: Category,
  need: number,
  questions: Question[],
  qStats: Map<string, QuestionStats>,
  topicEval: Map<TopicId, Evaluation>,
  now: Date,
  rng: Rng,
): Question[] {
  const pool: Candidate[] = questions
    .filter((q) => q.category === category)
    .map((question) => {
      const stats = qStats.get(question.id)!;
      return { question, stats, bucket: bucketOf(stats, topicEval.get(question.topic) ?? 'unrated') };
    });
  const fresh = pool.filter((c) => !isInCooldown(c.stats, now));
  const candidates = fresh.length >= need ? fresh : pool;
  return drawFromBuckets(candidates, need, rng);
}

/** Reorders so that adjacent questions rarely share a topic. Single pass, best effort. */
function spreadTopics(items: Question[]): Question[] {
  const arr = [...items];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i]!.topic !== arr[i - 1]!.topic) continue;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j]!.topic !== arr[i - 1]!.topic) {
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
        break;
      }
    }
  }
  return arr;
}

export function selectQuestions({ questions, records, count, now, rng }: SelectionInput): Question[] {
  const qStats = computeAllQuestionStats(questions, records);
  const topicStats = computeTopicStats(questions, records);
  const topicEval = new Map<TopicId, Evaluation>();
  for (const [topic, s] of topicStats) topicEval.set(topic, s.evaluation);

  const available: Record<Category, number> = {
    verbal: questions.filter((q) => q.category === 'verbal').length,
    nonverbal: questions.filter((q) => q.category === 'nonverbal').length,
  };
  const split = categorySplit(count, rng);
  // Shift quota to the other category when one side is short of questions.
  let verbalNeed = Math.min(split.verbal, available.verbal);
  let nonverbalNeed = Math.min(split.nonverbal, available.nonverbal);
  const leftover = count - verbalNeed - nonverbalNeed;
  if (leftover > 0) {
    const extraVerbal = Math.min(leftover, available.verbal - verbalNeed);
    verbalNeed += extraVerbal;
    nonverbalNeed += Math.min(leftover - extraVerbal, available.nonverbal - nonverbalNeed);
  }

  const picked = [
    ...selectForCategory('verbal', verbalNeed, questions, qStats, topicEval, now, rng),
    ...selectForCategory('nonverbal', nonverbalNeed, questions, qStats, topicEval, now, rng),
  ];
  return spreadTopics(shuffle(picked, rng));
}
