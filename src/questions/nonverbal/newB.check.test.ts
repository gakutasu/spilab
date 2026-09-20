import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateQuestions } from '../validate';
import { equationQuestions } from './equation';
import { geometryQuestions } from './geometry';
import { flowRatioQuestions } from './flowRatio';
import { graphRegionQuestions } from './graphRegion';

const all = [...equationQuestions, ...geometryQuestions, ...flowRatioQuestions, ...graphRegionQuestions];
const expected: Record<string, string> = JSON.parse(
  readFileSync('/tmp/claude-1000/-home-gakutasu-spilab/ff619621-4bb5-4007-9781-00bbbd7a18f3/scratchpad/expected.json', 'utf8'),
);

describe('new nonverbal B files', () => {
  it('validates', () => {
    expect(validateQuestions(all)).toEqual([]);
  });
  it('counts and ids', () => {
    expect(equationQuestions).toHaveLength(10);
    expect(geometryQuestions).toHaveLength(8);
    expect(flowRatioQuestions).toHaveLength(6);
    expect(graphRegionQuestions).toHaveLength(6);
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    expect(all.map((q) => q.id)).toEqual(Object.keys(expected));
  });
  it('answer line matches correct choice and independent computation', () => {
    for (const q of all) {
      const line = q.explanation.split('\n').find((l) => l.startsWith('答え：'));
      expect(line, q.id).toBeDefined();
      expect(line!.slice(3), q.id).toBe(q.choices[q.correctChoice]);
      expect(q.choices[q.correctChoice], q.id).toBe(expected[q.id]);
    }
  });
  it('format rules', () => {
    for (const q of all) {
      expect(q.explanation.startsWith('## 解き方\n\n'), q.id).toBe(true);
      expect(q.explanation.split('## ポイント').length, q.id).toBe(2);
      expect(q.explanation.match(/^## /gm)?.length, q.id).toBe(2);
      expect(q.explanation.length, `${q.id} len=${q.explanation.length}`).toBeGreaterThanOrEqual(200);
      expect(q.explanation.length, `${q.id} len=${q.explanation.length}`).toBeLessThanOrEqual(450);
      expect(q.recommendedTime, q.id).toBeGreaterThanOrEqual(60);
      expect(q.recommendedTime, q.id).toBeLessThanOrEqual(120);
      expect(q.tags.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.tags.length, q.id).toBeLessThanOrEqual(3);
      expect(q.subtopic, q.id).toMatch(/^[a-z_]+$/);
    }
  });
});
