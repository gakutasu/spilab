import type { SessionScope } from '../types';
import { CATEGORY_LABEL, topicLabel } from '../questions/topics';

export function describeScope(scope: SessionScope | undefined): string {
  if (!scope || scope.kind === 'all') return 'いつも通り（混合）';
  if (scope.kind === 'category') return `${CATEGORY_LABEL[scope.category]}のみ`;
  return topicLabel(scope.topic);
}
