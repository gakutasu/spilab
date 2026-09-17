import type { Question } from '../types';
import { vocabularyQuestions } from './verbal/vocabulary';
import { wordRelationQuestions } from './verbal/wordRelation';
import { idiomQuestions } from './verbal/idiom';
import { wordMeaningQuestions } from './verbal/wordMeaning';
import { sentenceOrderQuestions } from './verbal/sentenceOrder';
import { readingQuestions } from './verbal/reading';
import { ratioQuestions } from './nonverbal/ratio';
import { profitLossQuestions } from './nonverbal/profitLoss';
import { speedQuestions } from './nonverbal/speed';
import { workRateQuestions } from './nonverbal/workRate';
import { permutationQuestions } from './nonverbal/permutation';
import { combinationQuestions } from './nonverbal/combination';
import { probabilityQuestions } from './nonverbal/probability';
import { inferenceQuestions } from './nonverbal/inference';
import { setQuestions } from './nonverbal/set';
import { tableReadingQuestions } from './nonverbal/tableReading';
import { dataReadingQuestions } from './nonverbal/dataReading';

// Add a new topic file here to include its questions in the app.
export const questions: Question[] = [
  ...vocabularyQuestions,
  ...wordRelationQuestions,
  ...idiomQuestions,
  ...wordMeaningQuestions,
  ...sentenceOrderQuestions,
  ...readingQuestions,
  ...ratioQuestions,
  ...profitLossQuestions,
  ...speedQuestions,
  ...workRateQuestions,
  ...permutationQuestions,
  ...combinationQuestions,
  ...probabilityQuestions,
  ...inferenceQuestions,
  ...setQuestions,
  ...tableReadingQuestions,
  ...dataReadingQuestions,
];

export const questionMap: Map<string, Question> = new Map(questions.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return questionMap.get(id);
}
