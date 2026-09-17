import { timeRatio, timeBand, TIME_BAND_LABEL } from './timeRatio';

describe('timeRatio', () => {
  it('divides answer time (ms) by recommended time (sec)', () => {
    expect(timeRatio(20000, 30)).toBeCloseTo(0.667, 3);
    expect(timeRatio(45000, 30)).toBe(1.5);
  });

  it('guards against non-positive recommended time', () => {
    expect(timeRatio(10000, 0)).toBe(Infinity);
  });
});

describe('timeBand', () => {
  it('classifies boundaries inclusively at 1.0 and 1.5', () => {
    expect(timeBand(0.5)).toBe('fast');
    expect(timeBand(1.0)).toBe('fast');
    expect(timeBand(1.01)).toBe('slow');
    expect(timeBand(1.5)).toBe('slow');
    expect(timeBand(1.51)).toBe('very_slow');
  });

  it('has labels for every band', () => {
    expect(TIME_BAND_LABEL.fast).toContain('速い');
    expect(TIME_BAND_LABEL.slow).toBeTruthy();
    expect(TIME_BAND_LABEL.very_slow).toBeTruthy();
  });
});
