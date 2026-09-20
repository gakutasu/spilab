import type { Question } from '../types';
import { vocabularyQuestions } from './verbal/vocabulary';
import { wordRelationQuestions } from './verbal/wordRelation';
import { idiomQuestions } from './verbal/idiom';
import { idiomStructureQuestions } from './verbal/idiomStructure';
import { wordMeaningQuestions } from './verbal/wordMeaning';
import { wordUsageQuestions } from './verbal/wordUsage';
import { sentenceOrderQuestions } from './verbal/sentenceOrder';
import { fillBlankQuestions } from './verbal/fillBlank';
import { readingQuestions } from './verbal/reading';
import { ratioQuestions } from './nonverbal/ratio';
import { profitLossQuestions } from './nonverbal/profitLoss';
import { discountSettlementQuestions } from './nonverbal/discountSettlement';
import { speedQuestions } from './nonverbal/speed';
import { workRateQuestions } from './nonverbal/workRate';
import { permutationQuestions } from './nonverbal/permutation';
import { combinationQuestions } from './nonverbal/combination';
import { probabilityQuestions } from './nonverbal/probability';
import { inferenceQuestions } from './nonverbal/inference';
import { logicQuestions } from './nonverbal/logic';
import { setQuestions } from './nonverbal/set';
import { integerQuestions } from './nonverbal/integer';
import { equationQuestions } from './nonverbal/equation';
import { geometryQuestions } from './nonverbal/geometry';
import { tableReadingQuestions } from './nonverbal/tableReading';
import { dataReadingQuestions } from './nonverbal/dataReading';
import { flowRatioQuestions } from './nonverbal/flowRatio';
import { graphRegionQuestions } from './nonverbal/graphRegion';
import { engSynonymQuestions } from './english/synonym';
import { engFillBlankQuestions } from './english/fillBlank';
import { engDictionaryQuestions } from './english/dictionary';
import { engErrorQuestions } from './english/error';
import { engTranslationQuestions } from './english/translation';
import { engReadingQuestions } from './english/reading';

// Add a new topic file here to include its questions in the app.
export const questions: Question[] = [
  ...vocabularyQuestions,
  ...wordRelationQuestions,
  ...idiomQuestions,
  ...idiomStructureQuestions,
  ...wordMeaningQuestions,
  ...wordUsageQuestions,
  ...sentenceOrderQuestions,
  ...fillBlankQuestions,
  ...readingQuestions,
  ...ratioQuestions,
  ...profitLossQuestions,
  ...discountSettlementQuestions,
  ...speedQuestions,
  ...workRateQuestions,
  ...permutationQuestions,
  ...combinationQuestions,
  ...probabilityQuestions,
  ...inferenceQuestions,
  ...logicQuestions,
  ...setQuestions,
  ...integerQuestions,
  ...equationQuestions,
  ...geometryQuestions,
  ...tableReadingQuestions,
  ...dataReadingQuestions,
  ...flowRatioQuestions,
  ...graphRegionQuestions,
  ...engSynonymQuestions,
  ...engFillBlankQuestions,
  ...engDictionaryQuestions,
  ...engErrorQuestions,
  ...engTranslationQuestions,
  ...engReadingQuestions,
];

export const questionMap: Map<string, Question> = new Map(questions.map((q) => [q.id, q]));

export function getQuestion(id: string): Question | undefined {
  return questionMap.get(id);
}
