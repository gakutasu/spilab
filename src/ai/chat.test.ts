import type { Question } from '../types';
import { buildTutorSystemPrompt, PRESET_QUESTIONS, DEFAULT_MODELS } from './chat';

const q: Question = {
  id: 'nonverbal-permutation-001',
  category: 'nonverbal',
  topic: 'permutation',
  difficulty: 2,
  question: '7人から部長と副部長を選ぶ方法は？',
  choices: ['21通り', '35通り', '42通り', '49通り'],
  correctChoice: 2,
  recommendedTime: 40,
  explanation: '## 解き方\n\n7 × 6 = 42\n\n## ポイント\n\n順列。',
  tags: [],
};

describe('buildTutorSystemPrompt', () => {
  it('embeds the question, choices, correct answer, learner answer and explanation', () => {
    const p = buildTutorSystemPrompt({ question: q, selectedChoice: 0, result: 'incorrect', answerTimeMs: 52000 });
    expect(p).toContain('7人から部長と副部長');
    expect(p).toContain('C. 42通り');
    expect(p).toContain('【学習者の回答】A. 21通り（不正解、解答時間 52秒、目安 40秒）');
    expect(p).toContain('7 × 6 = 42');
    expect(p).toContain('LaTeX');
  });

  it('describes unknown answers', () => {
    const p = buildTutorSystemPrompt({ question: q, selectedChoice: null, result: 'unknown', answerTimeMs: 1000 });
    expect(p).toContain('【学習者の回答】わからない（「わからない」を選択');
  });
});

describe('presets and models', () => {
  it('has presets for every result and default models per provider', () => {
    for (const r of ['correct', 'incorrect', 'unknown'] as const) {
      expect(PRESET_QUESTIONS.filter((p) => !p.when || p.when.includes(r)).length).toBeGreaterThanOrEqual(3);
    }
    expect(DEFAULT_MODELS.anthropic[0]?.id).toBe('claude-opus-5');
    expect(DEFAULT_MODELS.openai.length).toBeGreaterThan(0);
  });
});
