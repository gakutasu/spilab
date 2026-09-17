import type { Question } from '../../types';

export const permutationQuestions: Question[] = [
  {
    id: 'nonverbal-permutation-001',
    category: 'nonverbal',
    topic: 'permutation',
    subtopic: 'role_assignment',
    difficulty: 2,
    question: '7人の候補者から部長1人と副部長1人を選ぶ方法は何通りありますか？',
    choices: ['21通り', '35通り', '42通り', '49通り'],
    correctChoice: 2,
    recommendedTime: 40,
    explanation: `## 解き方

この問題では「2人を選ぶ」だけではなく、部長と副部長という異なる役割があります。したがって選ぶ順番を区別します。

部長を7人から選ぶ：7通り

残った6人から副部長を選ぶ：6通り

よって、

7 × 6 = 42

答え：42通り

## ポイント

役割や並ぶ順番を区別する場合は順列Pを使います。役割を区別せず単に2人を選ぶだけなら組合せCで、7C2 = 21通りになります。「21通り」は役割を区別し忘れた場合の誤答です。`,
    tags: ['順列', 'P', '役割'],
  },
];
