import type { Question } from '../types';
import { parseGeneratedPayload, parseVerification } from './generate';
import { buildGenerationPrompt, buildVerifyPrompt } from './prompts';

const nextId = (i: number) => `nonverbal-probability-${String(100 + i).padStart(3, '0')}`;

const valid = {
  question: '2個のサイコロを振って和が7になる確率は？',
  passage: '',
  choices: ['1/6', '1/9', '1/12', '5/36'],
  correctChoice: 0,
  difficulty: 2,
  recommendedTime: 60,
  subtopic: 'dice',
  tags: ['確率', 'サイコロ'],
  explanation: '## 解き方\n\n全事象は36通り。和が7は6通り。\n\n6/36 = 1/6\n\n答え：1/6\n\n## ポイント\n\n全事象を先に数える。',
  selfCheck: '(1,6),(2,5),(3,4),(4,3),(5,2),(6,1) の6通り。6/36=1/6。一致。',
};

describe('parseGeneratedPayload', () => {
  it('builds validated questions with sequential ids', () => {
    const { drafts, errors } = parseGeneratedPayload(JSON.stringify({ questions: [valid] }), { topic: 'probability', nextId });
    expect(errors).toEqual([]);
    expect(drafts).toHaveLength(1);
    const q = drafts[0]!.question;
    expect(q).toMatchObject({ id: 'nonverbal-probability-100', category: 'nonverbal', topic: 'probability', subtopic: 'dice', correctChoice: 0 });
    expect(q.passage).toBeUndefined();
    expect(drafts[0]!.selfCheck).toContain('一致');
  });

  it('reports invalid items individually and keeps the valid ones', () => {
    const payload = {
      questions: [
        { ...valid, choices: ['a', 'b', 'c'] },
        { ...valid, explanation: '短い' },
        { ...valid, correctChoice: 4 },
        valid,
      ],
    };
    const { drafts, errors } = parseGeneratedPayload(JSON.stringify(payload), { topic: 'probability', nextId });
    expect(drafts).toHaveLength(1);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toContain('1問目');
    expect(errors[1]).toContain('explanation');
    expect(errors[2]).toContain('correctChoice');
  });

  it('handles non-JSON and missing array', () => {
    expect(parseGeneratedPayload('nope', { topic: 'ratio', nextId }).errors[0]).toContain('JSON');
    expect(parseGeneratedPayload('{}', { topic: 'ratio', nextId }).errors[0]).toContain('questions');
  });

  it('gives each draft a sequential id', () => {
    const { drafts } = parseGeneratedPayload(JSON.stringify({ questions: [valid, valid, valid] }), { topic: 'probability', nextId });
    expect(drafts.map((d) => d.question.id)).toEqual(['nonverbal-probability-100', 'nonverbal-probability-101', 'nonverbal-probability-102']);
  });
});

describe('parseVerification', () => {
  it('compares the independent answer with the draft', () => {
    const ok = parseVerification(JSON.stringify({ answerIndex: 0, confidence: 'high', reasoning: 'r', issues: '' }), 0);
    expect(ok.agrees).toBe(true);
    const ng = parseVerification(JSON.stringify({ answerIndex: 2, confidence: 'medium', reasoning: 'r', issues: '曖昧' }), 0);
    expect(ng.agrees).toBe(false);
    expect(ng.issues).toBe('曖昧');
  });
});

describe('prompts', () => {
  const example: Question = {
    id: 'nonverbal-probability-001',
    category: 'nonverbal',
    topic: 'probability',
    difficulty: 1,
    question: '例題',
    choices: ['a', 'b', 'c', 'd'],
    correctChoice: 1,
    recommendedTime: 50,
    explanation: 'x'.repeat(50),
    tags: [],
  };

  it('includes topic, count, examples and existing stems', () => {
    const p = buildGenerationPrompt({ topic: 'probability', count: 3, difficulty: 2, examples: [example], existingStems: ['既出A', '既出B'] });
    expect(p).toContain('確率');
    expect(p).toContain('3問');
    expect(p).toContain('難易度: 2');
    expect(p).toContain('例題');
    expect(p).toContain('- 既出A');
  });

  it('asks the verifier to solve without the explanation', () => {
    const p = buildVerifyPrompt({ question: 'Q', passage: 'P', choices: ['a', 'b', 'c', 'd'] });
    expect(p).toContain('【資料・条件】\nP');
    expect(p).toContain('0: a');
    expect(p).not.toContain('解説');
  });
});
