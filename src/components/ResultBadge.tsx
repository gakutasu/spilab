import type { AnswerResult } from '../types';

const LABEL: Record<AnswerResult, string> = {
  correct: '正解',
  incorrect: '不正解',
  unknown: 'わからない',
};

export function ResultBadge({ result }: { result: AnswerResult }) {
  return <span className={`badge badge-${result}`}>{LABEL[result]}</span>;
}
