import type { Category } from '../types';

export type TopicId =
  | 'vocabulary'
  | 'word_relation'
  | 'idiom'
  | 'word_meaning'
  | 'sentence_order'
  | 'reading'
  | 'ratio'
  | 'profit_loss'
  | 'speed'
  | 'work_rate'
  | 'permutation'
  | 'combination'
  | 'probability'
  | 'inference'
  | 'set'
  | 'table_reading'
  | 'data_reading';

export interface TopicInfo {
  category: Category;
  label: string;
}

export const TOPICS: Record<TopicId, TopicInfo> = {
  vocabulary: { category: 'verbal', label: '語彙' },
  word_relation: { category: 'verbal', label: '二語関係' },
  idiom: { category: 'verbal', label: '熟語' },
  word_meaning: { category: 'verbal', label: '語句の意味' },
  sentence_order: { category: 'verbal', label: '文の並べ替え' },
  reading: { category: 'verbal', label: '長文読解' },
  ratio: { category: 'nonverbal', label: '割合' },
  profit_loss: { category: 'nonverbal', label: '損益' },
  speed: { category: 'nonverbal', label: '速度' },
  work_rate: { category: 'nonverbal', label: '仕事算' },
  permutation: { category: 'nonverbal', label: '順列' },
  combination: { category: 'nonverbal', label: '組合せ' },
  probability: { category: 'nonverbal', label: '確率' },
  inference: { category: 'nonverbal', label: '推論' },
  set: { category: 'nonverbal', label: '集合' },
  table_reading: { category: 'nonverbal', label: '表の読み取り' },
  data_reading: { category: 'nonverbal', label: '資料読み取り' },
};

export const TOPIC_IDS = Object.keys(TOPICS) as TopicId[];

export const CATEGORY_LABEL: Record<Category, string> = {
  verbal: '言語',
  nonverbal: '非言語',
};

export function topicLabel(topic: TopicId): string {
  return TOPICS[topic].label;
}

export function isTopicId(value: string): value is TopicId {
  return value in TOPICS;
}
