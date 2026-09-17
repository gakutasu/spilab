import type { AnswerResult, Evaluation } from '../types';
import { EVALUATION_LABEL, STRONG_THRESHOLD } from './evaluation';
import { timeBand, timeRatio } from './timeRatio';

export interface FeedbackInput {
  result: AnswerResult;
  answerTimeMs: number;
  recommendedTime: number;
  topicLabel: string;
  topicEvalBefore: Evaluation;
  topicEvalAfter: Evaluation;
  topicScoreBefore: number;
  topicScoreAfter: number;
}

export interface Feedback {
  headline: string;
  lines: string[];
}

const APPROACHING_MARGIN = 10;

function evaluationLine(i: FeedbackInput): string {
  const before = EVALUATION_LABEL[i.topicEvalBefore];
  const after = EVALUATION_LABEL[i.topicEvalAfter];
  if (i.topicEvalAfter === 'unrated') {
    return `${i.topicLabel}：未評価（あと数回の回答で評価が確定します）`;
  }
  if (i.topicEvalBefore !== i.topicEvalAfter) {
    return `${i.topicLabel}：${before} → ${after}`;
  }
  if (
    i.topicEvalAfter === 'normal' &&
    i.topicScoreAfter > i.topicScoreBefore &&
    i.topicScoreAfter >= STRONG_THRESHOLD - APPROACHING_MARGIN
  ) {
    return `${i.topicLabel}：普通 → 得意に近づいています`;
  }
  return `この分野（${i.topicLabel}）は現在「${after}」です。`;
}

export function buildFeedback(i: FeedbackInput): Feedback {
  const ratio = timeRatio(i.answerTimeMs, i.recommendedTime);
  const band = timeBand(ratio);
  const lines: string[] = [];

  if (i.result === 'unknown') {
    lines.push('この問題は「解法未習得」として記録しました。');
    lines.push('今後、この分野を優先的に出題します。');
    lines.push(evaluationLine(i));
    return { headline: '解法未習得', lines };
  }

  if (i.result === 'incorrect') {
    lines.push('解説を読んで、考え方のどこでずれたかを確認しましょう。');
    lines.push(evaluationLine(i));
    return { headline: '不正解', lines };
  }

  if (band === 'fast') {
    lines.push(evaluationLine(i));
    return { headline: '正解！', lines };
  }
  if (band === 'slow') {
    lines.push('正解ですが、目安時間より少し時間がかかっています。');
  } else {
    lines.push(`正解していますが、目安時間の${ratio.toFixed(1)}倍かかっています。`);
    lines.push('理解はできていますが、処理速度に改善余地があります。');
  }
  lines.push(evaluationLine(i));
  return { headline: '正解', lines };
}
