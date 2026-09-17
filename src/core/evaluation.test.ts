import { evaluate, EVALUATION_LABEL } from './evaluation';

describe('evaluate', () => {
  it('returns unrated below 3 attempts regardless of score', () => {
    expect(evaluate(80, 2)).toBe('unrated');
    expect(evaluate(10, 0)).toBe('unrated');
  });

  it('classifies by thresholds with enough attempts', () => {
    expect(evaluate(80, 3)).toBe('strong');
    expect(evaluate(75, 5)).toBe('strong');
    expect(evaluate(74, 5)).toBe('normal');
    expect(evaluate(45, 5)).toBe('normal');
    expect(evaluate(44, 5)).toBe('weak');
  });

  it('has Japanese labels', () => {
    expect(EVALUATION_LABEL.strong).toBe('得意');
    expect(EVALUATION_LABEL.normal).toBe('普通');
    expect(EVALUATION_LABEL.weak).toBe('苦手');
    expect(EVALUATION_LABEL.unrated).toBe('未評価');
  });
});
