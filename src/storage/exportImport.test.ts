import { buildExport, parseImport, exportFileName } from './exportImport';

const answers = [{ id: 1, questionId: 'q1', timestamp: '2026-09-18T00:00:00.000Z', selectedChoice: 0, result: 'correct' as const, answerTimeMs: 100 }];

describe('buildExport', () => {
  it('wraps settings and answers with metadata', () => {
    const data = buildExport({ questionsPerDay: 7 }, answers, new Date('2026-09-18T01:02:03.000Z'));
    expect(data).toEqual({
      app: 'spilab',
      version: 1,
      exportedAt: '2026-09-18T01:02:03.000Z',
      settings: { questionsPerDay: 7 },
      answers,
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
    const json = JSON.stringify(buildExport({ questionsPerDay: 5 }, answers, new Date()));
    const parsed = parseImport(json);
    expect(parsed.answers).toHaveLength(1);
    expect(parsed.settings.questionsPerDay).toBe(5);
  });

  it('rejects invalid input with Japanese messages', () => {
    expect(() => parseImport('nope')).toThrow(/JSON/);
    expect(() => parseImport(JSON.stringify({ app: 'other', version: 1, answers: [] }))).toThrow(/SPILAB/);
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: 'x' }))).toThrow(/answers/);
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: [{ questionId: 'q' }] }))).toThrow(/1件目/);
    expect(() => parseImport(JSON.stringify({ app: 'spilab', version: 2, answers: [] }))).toThrow(/バージョン/);
  });

  it('falls back to default settings when missing', () => {
    const parsed = parseImport(JSON.stringify({ app: 'spilab', version: 1, answers: [] }));
    expect(parsed.settings).toEqual({ questionsPerDay: 7 });
  });
});
