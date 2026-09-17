import { validateQuestions } from './validate';
import type { Question } from '../types';

const base: Question = {
  id: 'nonverbal-permutation-001',
  category: 'nonverbal',
  topic: 'permutation',
  difficulty: 2,
  question: '7人から部長と副部長を選ぶ方法は？',
  choices: ['21通り', '35通り', '42通り', '49通り'],
  correctChoice: 2,
  recommendedTime: 40,
  explanation: '## 解き方\n\n役割が異なるので順列。7 × 6 = 42 通り。\n\n## ポイント\n\n役割を区別するときは P を使う。',
  tags: ['順列'],
};

function q(overrides: Partial<Question>): Question {
  return { ...base, ...overrides } as Question;
}

describe('validateQuestions', () => {
  it('returns no errors for valid data', () => {
    expect(validateQuestions([base, q({ id: 'nonverbal-permutation-002' })])).toEqual([]);
  });

  it('detects duplicate ids', () => {
    const errors = validateQuestions([base, q({})]);
    expect(errors.some((e) => e.includes('duplicate') && e.includes(base.id))).toBe(true);
  });

  it('rejects ids with invalid characters', () => {
    const errors = validateQuestions([q({ id: 'Bad_ID 1' })]);
    expect(errors.some((e) => e.includes('id format'))).toBe(true);
  });

  it('requires exactly four non-empty distinct choices', () => {
    const three = validateQuestions([q({ choices: ['a', 'b', 'c'] as unknown as Question['choices'] })]);
    expect(three.some((e) => e.includes('choices'))).toBe(true);
    const empty = validateQuestions([q({ choices: ['a', '', 'c', 'd'] })]);
    expect(empty.some((e) => e.includes('choices'))).toBe(true);
    const dup = validateQuestions([q({ choices: ['a', 'a', 'c', 'd'] })]);
    expect(dup.some((e) => e.includes('choices'))).toBe(true);
  });

  it('requires correctChoice within 0..3', () => {
    const errors = validateQuestions([q({ correctChoice: 4 as unknown as Question['correctChoice'] })]);
    expect(errors.some((e) => e.includes('correctChoice'))).toBe(true);
  });

  it('requires a substantial explanation', () => {
    const errors = validateQuestions([q({ explanation: 'Cが正解' })]);
    expect(errors.some((e) => e.includes('explanation'))).toBe(true);
  });

  it('requires positive recommendedTime', () => {
    const errors = validateQuestions([q({ recommendedTime: 0 })]);
    expect(errors.some((e) => e.includes('recommendedTime'))).toBe(true);
  });

  it('requires known topic matching category', () => {
    const unknown = validateQuestions([q({ topic: 'nope' as unknown as Question['topic'] })]);
    expect(unknown.some((e) => e.includes('topic'))).toBe(true);
    const mismatch = validateQuestions([q({ category: 'verbal' })]);
    expect(mismatch.some((e) => e.includes('category'))).toBe(true);
  });

  it('requires non-empty question text', () => {
    const errors = validateQuestions([q({ question: '  ' })]);
    expect(errors.some((e) => e.includes('question'))).toBe(true);
  });
});
