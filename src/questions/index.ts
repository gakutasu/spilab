import type { Question } from '../types';
import { wordRelationQuestions } from './verbal/wordRelation';
import { permutationQuestions } from './nonverbal/permutation';

// Add a new topic file here to include its questions in the app.
export const questions: Question[] = [
  ...wordRelationQuestions,
  ...permutationQuestions,
];

export const questionMap: Map<string, Question> = new Map(questions.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return questionMap.get(id);
}
