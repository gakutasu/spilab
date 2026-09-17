import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DEFAULT_SETTINGS, type AnswerRecord, type Settings } from '../types';

const DB_NAME = 'spilab';
const DB_VERSION = 1;

interface SpilabDB extends DBSchema {
  answers: {
    key: number;
    value: AnswerRecord;
    indexes: { byQuestion: string; byTimestamp: string };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let dbPromise: Promise<IDBPDatabase<SpilabDB>> | null = null;

function db(): Promise<IDBPDatabase<SpilabDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SpilabDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        const answers = database.createObjectStore('answers', { keyPath: 'id', autoIncrement: true });
        answers.createIndex('byQuestion', 'questionId');
        answers.createIndex('byTimestamp', 'timestamp');
        database.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

export async function addAnswer(record: Omit<AnswerRecord, 'id'>): Promise<number> {
  const { id: _ignored, ...rest } = record as AnswerRecord;
  return (await db()).add('answers', rest as AnswerRecord);
}

export async function getAllAnswers(): Promise<AnswerRecord[]> {
  return (await db()).getAll('answers');
}

export async function getAnswersByQuestion(questionId: string): Promise<AnswerRecord[]> {
  return (await db()).getAllFromIndex('answers', 'byQuestion', questionId);
}

export async function clearAnswers(): Promise<void> {
  await (await db()).clear('answers');
}

/** Adds records not already present (matched by questionId + timestamp). Returns the number added. */
export async function importAnswers(records: AnswerRecord[]): Promise<number> {
  const database = await db();
  const existing = await database.getAll('answers');
  const seen = new Set(existing.map((r) => `${r.questionId}|${r.timestamp}`));
  const tx = database.transaction('answers', 'readwrite');
  let added = 0;
  for (const r of records) {
    const key = `${r.questionId}|${r.timestamp}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { id: _ignored, ...rest } = r;
    await tx.store.add(rest as AnswerRecord);
    added += 1;
  }
  await tx.done;
  return added;
}

const SETTINGS_KEY = 'settings';

export async function getSettings(): Promise<Settings> {
  const stored = await (await db()).get('settings', SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await (await db()).put('settings', settings, SETTINGS_KEY);
}
