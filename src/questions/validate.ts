import type { Question } from '../types';
import { TOPICS, isTopicId } from './topics';

const ID_PATTERN = /^[a-z0-9-]+$/;
const MIN_EXPLANATION_LENGTH = 40;

/** Returns a list of human-readable problems. Empty means the data is valid. */
export function validateQuestions(questions: Question[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const q of questions) {
    const tag = `[${q.id}]`;

    if (typeof q.id !== 'string' || !ID_PATTERN.test(q.id)) {
      errors.push(`${tag} id format must match ${ID_PATTERN}`);
    }
    if (seen.has(q.id)) {
      errors.push(`${tag} duplicate id`);
    }
    seen.add(q.id);

    if (q.category !== 'verbal' && q.category !== 'nonverbal' && q.category !== 'english') {
      errors.push(`${tag} category must be verbal, nonverbal or english`);
    }
    if (!isTopicId(q.topic)) {
      errors.push(`${tag} unknown topic "${q.topic}"`);
    } else if (TOPICS[q.topic].category !== q.category) {
      errors.push(`${tag} category "${q.category}" does not match topic "${q.topic}"`);
    }

    if (typeof q.question !== 'string' || q.question.trim() === '') {
      errors.push(`${tag} question text is empty`);
    }

    if (!Array.isArray(q.choices) || q.choices.length !== 4) {
      errors.push(`${tag} choices must have exactly 4 entries`);
    } else {
      if (q.choices.some((c) => typeof c !== 'string' || c.trim() === '')) {
        errors.push(`${tag} choices must not be empty`);
      }
      if (new Set(q.choices).size !== 4) {
        errors.push(`${tag} choices must be distinct`);
      }
    }

    if (!Number.isInteger(q.correctChoice) || q.correctChoice < 0 || q.correctChoice > 3) {
      errors.push(`${tag} correctChoice must be 0..3`);
    }

    if (typeof q.explanation !== 'string' || q.explanation.trim().length < MIN_EXPLANATION_LENGTH) {
      errors.push(`${tag} explanation is missing or too short (min ${MIN_EXPLANATION_LENGTH} chars)`);
    }

    if (typeof q.recommendedTime !== 'number' || !(q.recommendedTime > 0)) {
      errors.push(`${tag} recommendedTime must be a positive number`);
    }

    if (![1, 2, 3].includes(q.difficulty)) {
      errors.push(`${tag} difficulty must be 1, 2 or 3`);
    }
  }

  return errors;
}
