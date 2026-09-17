/** JSON schema for the generation response (structured outputs). */
export const GENERATION_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string', description: '問題文。改行は\\nで表す。' },
          passage: { type: 'string', description: '参照文・表・条件。不要なら空文字。' },
          choices: { type: 'array', items: { type: 'string' }, description: '選択肢4つ。単位付き。' },
          correctChoice: { type: 'integer', enum: [0, 1, 2, 3], description: '正解の選択肢の0始まりインデックス' },
          difficulty: { type: 'integer', enum: [1, 2, 3] },
          recommendedTime: { type: 'integer', description: '目安時間（秒）' },
          subtopic: { type: 'string', description: 'snake_caseの英語サブトピック' },
          tags: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string', description: '「## 解き方」「## ポイント」の2節からなる詳細解説' },
          selfCheck: { type: 'string', description: '別の方法で答えを再計算・再検討した記録' },
        },
        required: ['question', 'passage', 'choices', 'correctChoice', 'difficulty', 'recommendedTime', 'subtopic', 'tags', 'explanation', 'selfCheck'],
        additionalProperties: false,
      },
    },
  },
  required: ['questions'],
  additionalProperties: false,
} as const;

export const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    answerIndex: { type: 'integer', enum: [0, 1, 2, 3], description: '自分で解いて得た正解のインデックス' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reasoning: { type: 'string', description: '解いた過程の要約（200字以内）' },
    issues: { type: 'string', description: '問題文・選択肢の不備や曖昧さ。なければ空文字。' },
  },
  required: ['answerIndex', 'confidence', 'reasoning', 'issues'],
  additionalProperties: false,
} as const;
