import { HERO_MESSAGES } from './messages';

describe('HERO_MESSAGES', () => {
  it('has at least 200 unique, non-empty messages', () => {
    expect(HERO_MESSAGES.length).toBeGreaterThanOrEqual(200);
    expect(new Set(HERO_MESSAGES.map((m) => m.text)).size).toBe(HERO_MESSAGES.length);
    expect(HERO_MESSAGES.every((m) => m.text.trim().length > 0)).toBe(true);
  });
});
