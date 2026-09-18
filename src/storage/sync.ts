import type { SupabaseClient } from '@supabase/supabase-js';
import type { AnswerRecord, Question, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { validateQuestions } from '../questions/validate';
import { addGeneratedQuestions, getAllAnswers, getGeneratedQuestions, getSettings, importAnswers, saveSettings } from './db';

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

export interface GeneratedRow {
  user_id: string;
  id: string;
  data: Question;
}

export interface SettingsRow {
  user_id: string;
  questions_per_day: number;
  ai_model: string;
  ai_verify: boolean;
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
  return { user_id: userId, questions_per_day: s.questionsPerDay, ai_model: s.aiModel, ai_verify: s.aiVerify };
}

export function fromSettingsRow(row: Partial<SettingsRow>): Settings {
  return {
    questionsPerDay: typeof row.questions_per_day === 'number' ? row.questions_per_day : DEFAULT_SETTINGS.questionsPerDay,
    aiModel: typeof row.ai_model === 'string' ? row.ai_model : DEFAULT_SETTINGS.aiModel,
    aiVerify: typeof row.ai_verify === 'boolean' ? row.ai_verify : DEFAULT_SETTINGS.aiVerify,
  };
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

export async function pushGenerated(client: SupabaseClient, userId: string, questions: Question[]): Promise<void> {
  if (questions.length === 0) return;
  const rows: GeneratedRow[] = questions.map((q) => ({ user_id: userId, id: q.id, data: q }));
  const { error } = await client.from('generated_questions').upsert(rows, { onConflict: 'user_id,id' });
  fail('generated push', error);
}

export async function deleteGeneratedRemote(client: SupabaseClient, userId: string, ids: string[] | 'all'): Promise<void> {
  let query = client.from('generated_questions').delete().eq('user_id', userId);
  if (ids !== 'all') query = query.in('id', ids);
  const { error } = await query;
  fail('generated delete', error);
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
  pulledGenerated: number;
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

  const generatedRes = await client.from('generated_questions').select('id,data').eq('user_id', userId);
  fail('generated pull', generatedRes.error);
  const remoteGenerated = ((generatedRes.data ?? []) as Array<{ data: Question }>).map((r) => r.data);
  const validGenerated = remoteGenerated.filter((q) => validateQuestions([q]).length === 0);
  const pulledGenerated = await addGeneratedQuestions(validGenerated);

  let settingsApplied = false;
  if (firstSync) {
    const settingsRes = await client.from('settings').select('*').eq('user_id', userId).maybeSingle();
    fail('settings pull', settingsRes.error);
    if (settingsRes.data) {
      await saveSettings(fromSettingsRow(settingsRes.data as SettingsRow));
      settingsApplied = true;
    }
  }

  await pushAnswers(client, userId, await getAllAnswers());
  await pushGenerated(client, userId, await getGeneratedQuestions());
  await pushSettings(client, userId, await getSettings());

  saveLastSyncAt(nextWatermark(since, remoteAnswers) ?? new Date().toISOString());
  return { pulledAnswers, pulledGenerated, settingsApplied };
}
