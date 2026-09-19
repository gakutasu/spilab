import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnswerRecord, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { getAllAnswers, getSettings, importAnswers, saveSettings } from './db';

export const LAST_SYNC_KEY = 'spilab.lastSyncAt';
const CHUNK = 500;

export interface AnswerRow {
  user_id: string;
  question_id: string;
  answered_at: string;
  selected_choice: number | null;
  result: AnswerRecord['result'];
  answer_time_ms: number;
  created_at?: string;
}

export interface SettingsRow {
  user_id: string;
  questions_per_day: number;
  updated_at?: string;
}

export function toAnswerRow(userId: string, r: AnswerRecord): AnswerRow {
  return {
    user_id: userId,
    question_id: r.questionId,
    answered_at: r.timestamp,
    selected_choice: r.selectedChoice,
    result: r.result,
    answer_time_ms: r.answerTimeMs,
  };
}

export function fromAnswerRow(row: AnswerRow): AnswerRecord {
  return {
    questionId: row.question_id,
    timestamp: new Date(row.answered_at).toISOString(),
    selectedChoice: row.selected_choice,
    result: row.result,
    answerTimeMs: row.answer_time_ms,
  };
}

export function toSettingsRow(userId: string, s: Settings): SettingsRow {
  return { user_id: userId, questions_per_day: s.questionsPerDay };
}

/** Only the synced fields; callers merge the result over local settings. */
export function fromSettingsRow(row: Partial<SettingsRow>): Pick<Settings, 'questionsPerDay'> {
  return { questionsPerDay: typeof row.questions_per_day === 'number' ? row.questions_per_day : DEFAULT_SETTINGS.questionsPerDay };
}

/** Latest created_at among pulled rows, or the previous watermark when nothing was pulled. */
export function nextWatermark(previous: string | null, rows: Array<{ created_at?: string }>): string | null {
  let max = previous;
  for (const r of rows) {
    if (r.created_at && (!max || r.created_at > max)) max = r.created_at;
  }
  return max;
}

export function chunk<T>(items: T[], size = CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadLastSyncAt(): string | null {
  return storage()?.getItem(LAST_SYNC_KEY) ?? null;
}

export function saveLastSyncAt(value: string | null): void {
  if (value) storage()?.setItem(LAST_SYNC_KEY, value);
  else storage()?.removeItem(LAST_SYNC_KEY);
}

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

export async function pushAnswers(client: SupabaseClient, userId: string, records: AnswerRecord[]): Promise<void> {
  for (const part of chunk(records.map((r) => toAnswerRow(userId, r)))) {
    const { error } = await client.from('answers').upsert(part, { onConflict: 'user_id,question_id,answered_at', ignoreDuplicates: true });
    fail('answers push', error);
  }
}

export async function deleteAnswersRemote(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client.from('answers').delete().eq('user_id', userId);
  fail('answers delete', error);
}

export async function pushSettings(client: SupabaseClient, userId: string, settings: Settings): Promise<void> {
  const row = { ...toSettingsRow(userId, settings), updated_at: new Date().toISOString() };
  const { error } = await client.from('settings').upsert(row, { onConflict: 'user_id' });
  fail('settings push', error);
}

export interface SyncResult {
  pulledAnswers: number;
  settingsApplied: boolean;
}

/**
 * Full two-way merge. Records are append-only, so pull then push with duplicate
 * suppression on both sides yields the union. Remote settings win on first sync only.
 */
export async function syncAll(client: SupabaseClient, userId: string): Promise<SyncResult> {
  const since = loadLastSyncAt();
  const firstSync = since === null;

  let answersQuery = client.from('answers').select('*').eq('user_id', userId).order('created_at', { ascending: true });
  if (since) answersQuery = answersQuery.gt('created_at', since);
  const answersRes = await answersQuery;
  fail('answers pull', answersRes.error);
  const remoteAnswers = (answersRes.data ?? []) as AnswerRow[];
  const pulledAnswers = await importAnswers(remoteAnswers.map(fromAnswerRow));


  let settingsApplied = false;
  if (firstSync) {
    const settingsRes = await client.from('settings').select('*').eq('user_id', userId).maybeSingle();
    fail('settings pull', settingsRes.error);
    if (settingsRes.data) {
      await saveSettings({ ...(await getSettings()), ...fromSettingsRow(settingsRes.data as SettingsRow) });
      settingsApplied = true;
    }
  }

  await pushAnswers(client, userId, await getAllAnswers());
  await pushSettings(client, userId, await getSettings());

  saveLastSyncAt(nextWatermark(since, remoteAnswers) ?? new Date().toISOString());
  return { pulledAnswers, settingsApplied };
}
