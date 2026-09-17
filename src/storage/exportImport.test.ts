import { buildExport, parseImport, exportFileName } from './exportImport';
import { DEFAULT_SETTINGS, type Question } from '../types';

const answers = [{ id: 1, questionId: 'q1', timestamp: '2026-09-18T00:00:00.000Z', selectedChoice: 0, result: 'correct' as const, answerTimeMs: 100 }];

const generated: Question = {
  id: 'ai-probability-abc',
  category: 'nonverbal',
  topic: 'probability',
  difficulty: 2,
  question: 'q',
  choices: ['a', 'b', 'c', 'd'],
  correctChoice: 1,
  recommendedTime: 60,
  explanation: 'x'.repeat(50),
  tags: ['確率'],
  source: 'ai',
  createdAt: '2026-09-18T00:00:00.000Z',
  generatedBy: 'claude-opus-5',
};

describe('buildExport', () => {
  it('wraps settings, answers and generated questions with metadata', () => {
    const data = buildExport(DEFAULT_SETTINGS, answers, [generated], new Date('2026-09-18T01:02:03.000Z'));
    expect(data).toEqual({
      app: 'spilab',
      version: 1,
      exportedAt: '2026-09-18T01:02:03.000Z',
      settings: DEFAULT_SETTINGS,
      answers,
      generatedQuestions: [generated],
    });
  });
});

describe('exportFileName', () => {
  it('embeds the local date', () => {
    expect(exportFileName(new Date(2026, 8, 18))).toBe('spilab-export-2026-09-18.json');
  });
});

describe('parseImport', () => {
  it('accepts a valid export', () => {
    const json = JSON.stringify(buildExport({ ...DEFAULT_SETTINGS, questionsPerDay: 5 }, answers, [generated], new Date()));
    const parsed = parseImport(json);
    expect(parsed.answers).toHaveLength(1);
    expect(parsed.settings.questionsPerDay).toBe(5);
    expect(parsed.generatedQuestions).toHaveLength(1);
  });

  it('accepts older exports without generated questions', () => {
    const parsed = parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: [], settings: { questionsPerDay: 7 } }));
    expect(parsed.generatedQuestions).toEqual([]);
    expect(parsed.settings).toEqual({ ...DEFAULT_SETTINGS, questionsPerDay: 7 });
  });

  it('rejects invalid input with Japanese messages', () => {
    expect(() => parseImport('nope')).toThrow(/JSON/);
    expect(() => parseImport(JSON.stringify({ app: 'other', version: 1, answers: [] }))).toThrow(/SPILAB/);
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: 'x' }))).toThrow(/answers/);
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: [{ questionId: 'q' }] }))).toThrow(/1件目/);
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 2, answers: [] }))).toThrow(/バージョン/);
  });

  it('rejects invalid generated questions', () => {
    const bad = { ...generated, choices: ['a', 'b'] };
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: [], generatedQuestions: [bad] }))).toThrow(
      /generatedQuestions/,
    );
  });

  it('falls back to default settings when missing', () => {
    const parsed = parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: [] }));
    expect(parsed.settings).toEqual(DEFAULT_SETTINGS);
  });
});
