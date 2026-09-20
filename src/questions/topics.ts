import type { Category } from '../types';

export type TopicId =
  // 言語
  | 'vocabulary'
  | 'word_relation'
  | 'idiom'
  | 'idiom_structure'
  | 'word_meaning'
  | 'word_usage'
  | 'sentence_order'
  | 'fill_blank'
  | 'reading'
  // 非言語
  | 'ratio'
  | 'profit_loss'
  | 'discount_settlement'
  | 'speed'
  | 'work_rate'
  | 'permutation'
  | 'combination'
  | 'probability'
  | 'inference'
  | 'logic'
  | 'set'
  | 'integer'
  | 'equation'
  | 'geometry'
  | 'table_reading'
  | 'data_reading'
  | 'flow_ratio'
  | 'graph_region'
  // 英語
  | 'eng_synonym'
  | 'eng_fill_blank'
  | 'eng_dictionary'
  | 'eng_error'
  | 'eng_translation'
  | 'eng_reading';

/** Which SPI delivery formats a topic appears in. */
export type TestFormat = 'testcenter' | 'paper';

export interface TopicInfo {
  category: Category;
  label: string;
  formats: TestFormat[];
}

const BOTH: TestFormat[] = ['testcenter', 'paper'];
const TC: TestFormat[] = ['testcenter'];
const PAPER: TestFormat[] = ['paper'];

export const TOPICS: Record<TopicId, TopicInfo> = {
  vocabulary: { category: 'verbal', label: '語彙（同意語・反意語）', formats: BOTH },
  word_relation: { category: 'verbal', label: '二語関係', formats: BOTH },
  idiom: { category: 'verbal', label: '熟語・慣用句', formats: BOTH },
  idiom_structure: { category: 'verbal', label: '熟語の成り立ち', formats: TC },
  word_meaning: { category: 'verbal', label: '語句の意味', formats: BOTH },
  word_usage: { category: 'verbal', label: '語句の用法', formats: TC },
  sentence_order: { category: 'verbal', label: '文の並べ替え', formats: BOTH },
  fill_blank: { category: 'verbal', label: '空欄補充', formats: TC },
  reading: { category: 'verbal', label: '長文読解', formats: BOTH },
  ratio: { category: 'nonverbal', label: '割合・比', formats: BOTH },
  profit_loss: { category: 'nonverbal', label: '損益算', formats: BOTH },
  discount_settlement: { category: 'nonverbal', label: '料金割引・代金精算', formats: BOTH },
  speed: { category: 'nonverbal', label: '速さ', formats: BOTH },
  work_rate: { category: 'nonverbal', label: '仕事算', formats: BOTH },
  permutation: { category: 'nonverbal', label: '順列', formats: BOTH },
  combination: { category: 'nonverbal', label: '組合せ', formats: BOTH },
  probability: { category: 'nonverbal', label: '確率', formats: BOTH },
  inference: { category: 'nonverbal', label: '推論（順序・位置・対応）', formats: BOTH },
  logic: { category: 'nonverbal', label: '命題・論理', formats: BOTH },
  set: { category: 'nonverbal', label: '集合', formats: BOTH },
  integer: { category: 'nonverbal', label: '整数・数列', formats: TC },
  equation: { category: 'nonverbal', label: '方程式・不等式', formats: TC },
  geometry: { category: 'nonverbal', label: '図形', formats: BOTH },
  table_reading: { category: 'nonverbal', label: '表の読み取り', formats: BOTH },
  data_reading: { category: 'nonverbal', label: '資料読み取り', formats: BOTH },
  flow_ratio: { category: 'nonverbal', label: '物の流れと比率', formats: PAPER },
  graph_region: { category: 'nonverbal', label: 'グラフの領域', formats: PAPER },
  eng_synonym: { category: 'english', label: '英語：同意語・反意語', formats: BOTH },
  eng_fill_blank: { category: 'english', label: '英語：空欄補充', formats: BOTH },
  eng_dictionary: { category: 'english', label: '英語：英英辞典', formats: BOTH },
  eng_error: { category: 'english', label: '英語：誤文訂正', formats: BOTH },
  eng_translation: { category: 'english', label: '英語：和文英訳', formats: BOTH },
  eng_reading: { category: 'english', label: '英語：長文読解', formats: BOTH },
};

export const TOPIC_IDS = Object.keys(TOPICS) as TopicId[];

export const CATEGORY_LABEL: Record<Category, string> = {
  verbal: '言語',
  nonverbal: '非言語',
  english: '英語',
};

export const CATEGORIES: Category[] = ['verbal', 'nonverbal', 'english'];

export function topicLabel(topic: TopicId): string {
  return TOPICS[topic].label;
}

export function isTopicId(value: string): value is TopicId {
  return value in TOPICS;
}
