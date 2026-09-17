import { DEFAULT_SETTINGS, type AnswerRecord, type Settings } from '../types';
import { localDateKey } from '../core/stats';

export const EXPORT_VERSION = 1;

export interface ExportData {
  app: 'spilab';
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  settings: Settings;
  answers: AnswerRecord[];
}

export function buildExport(settings: Settings, answers: AnswerRecord[], now: Date = new Date()): ExportData {
  return { app: 'spilab', version: EXPORT_VERSION, exportedAt: now.toISOString(), settings, answers };
}

export function exportFileName(now: Date = new Date()): string {
  return `spilab-export-${localDateKey(now.toISOString())}.json`;
}

const RESULTS = new Set(['correct', 'incorrect', 'unknown']);

function isRecord(value: unknown): value is AnswerRecord {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.questionId === 'string' &&
    typeof v.timestamp === 'string' &&
    (typeof v.selectedChoice === 'number' || v.selectedChoice === null) &&
    typeof v.result === 'string' &&
    RESULTS.has(v.result) &&
    typeof v.answerTimeMs === 'number'
  );
}

/** Parses exported JSON. Throws an Error with a user-facing Japanese message on invalid input. */
export function parseImport(json: string): ExportData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('JSONとして読み込めませんでした。');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('JSONの形式が不正です。');
  const v = parsed as Record<string, unknown>;
  if (v.app !== 'spilab') throw new Error('SPILABの書き出しデータではありません。');
  if (v.version !== EXPORT_VERSION) throw new Error(`対応していないデータバージョンです（${String(v.version)}）。`);
  if (!Array.isArray(v.answers)) throw new Error('answers が配列ではありません。');
  v.answers.forEach((r, i) => {
    if (!isRecord(r)) throw new Error(`answers の${i + 1}件目の形式が不正です。`);
  });

  const s = (v.settings ?? {}) as Partial<Settings>;
  const settings: Settings = {
    questionsPerDay: typeof s.questionsPerDay === 'number' ? s.questionsPerDay : DEFAULT_SETTINGS.questionsPerDay,
  };
  return {
    app: 'spilab',
    version: EXPORT_VERSION,
    exportedAt: typeof v.exportedAt === 'string' ? v.exportedAt : '',
    settings,
    answers: v.answers as AnswerRecord[],
  };
}
