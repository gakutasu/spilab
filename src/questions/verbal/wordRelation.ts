import type { Question } from '../../types';

export const wordRelationQuestions: Question[] = [
  {
    id: 'verbal-word-relation-001',
    category: 'verbal',
    topic: 'word_relation',
    subtopic: 'inclusion',
    difficulty: 1,
    question: '最初の二語の関係と同じ関係になる組み合わせを選びなさい。\n\n「野菜：トマト」',
    choices: ['楽器：ピアノ', '医者：病院', '鉛筆：文房具', '太陽：月'],
    correctChoice: 0,
    recommendedTime: 20,
    explanation: `## 解き方

「野菜：トマト」は、トマトが野菜の一種であるという「包含関係（グループ：その一例）」です。左が大きなグループ、右がその具体例という向きも確認します。

各選択肢を見ると、

- 楽器：ピアノ → ピアノは楽器の一種。左がグループ、右が例で向きも同じ。
- 医者：病院 → 医者が働く場所。包含関係ではない。
- 鉛筆：文房具 → 包含関係だが、左が例で右がグループと向きが逆。
- 太陽：月 → 対になる語で、包含関係ではない。

答え：楽器：ピアノ

## ポイント

二語関係では「関係の種類」だけでなく「左右の向き」も一致させる必要があります。「鉛筆：文房具」は関係の種類は同じでも向きが逆なので不正解です。`,
    tags: ['二語関係', '包含'],
  },
];
