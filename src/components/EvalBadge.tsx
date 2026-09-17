import type { Evaluation } from '../types';
import { EVALUATION_LABEL } from '../core/evaluation';

export function EvalBadge({ evaluation }: { evaluation: Evaluation }) {
  return <span className={`badge badge-${evaluation}`}>{EVALUATION_LABEL[evaluation]}</span>;
}
