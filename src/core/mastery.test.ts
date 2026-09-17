import { INITIAL_MASTERY, masteryDelta, applyMastery, computeMastery } from './mastery';

describe('masteryDelta', () => {
  it('rewards correct answers by speed', () => {
    expect(masteryDelta('correct', 0.8)).toBe(8);
    expect(masteryDelta('correct', 1.0)).toBe(8);
    expect(masteryDelta('correct', 1.2)).toBe(5);
    expect(masteryDelta('correct', 1.5)).toBe(5);
    expect(masteryDelta('correct', 2.0)).toBe(2);
  });

  it('penalizes incorrect and unknown differently', () => {
    expect(masteryDelta('incorrect', 0.5)).toBe(-7);
    expect(masteryDelta('unknown', 0.5)).toBe(-10);
  });
});

describe('applyMastery', () => {
  it('clamps to 0..100', () => {
    expect(applyMastery(100, 'correct', 0.5)).toBe(100);
    expect(applyMastery(96, 'correct', 0.5)).toBe(100);
    expect(applyMastery(0, 'unknown', 0.5)).toBe(0);
    expect(applyMastery(5, 'incorrect', 0.5)).toBe(0);
  });
});

describe('computeMastery', () => {
  it('starts at 50 with no records', () => {
    expect(INITIAL_MASTERY).toBe(50);
    expect(computeMastery([])).toBe(50);
  });

  it('applies records in order', () => {
    const score = computeMastery([
      { result: 'correct', answerTimeMs: 20000, recommendedTime: 30 }, // +8
      { result: 'incorrect', answerTimeMs: 20000, recommendedTime: 30 }, // -7
      { result: 'unknown', answerTimeMs: 20000, recommendedTime: 30 }, // -10
    ]);
    expect(score).toBe(41);
  });
});
