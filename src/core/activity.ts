import type { AnswerRecord } from '../types';
import { localDateKey } from './stats';

export function dailyCounts(records: AnswerRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of records) {
    const k = localDateKey(r.timestamp);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

/** 0 = none, 1 = 1-3, 2 = 4-7, 3 = 8-14, 4 = 15+ answers in a day. */
export function activityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 14) return 3;
  return 4;
}

export interface HeatmapCell {
  date: Date;
  key: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

function keyOf(d: Date): string {
  return localDateKey(d.toISOString());
}

/** Sunday-first weeks, the last one containing `today`. */
export function heatmapWeeks(records: AnswerRecord[], weeks: number, today: Date = new Date()): HeatmapCell[][] {
  const counts = dailyCounts(records);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfWeek = new Date(end);
  endOfWeek.setDate(end.getDate() + (6 - end.getDay()));
  const start = new Date(endOfWeek);
  start.setDate(endOfWeek.getDate() - weeks * 7 + 1);

  const out: HeatmapCell[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      const key = keyOf(date);
      const count = counts.get(key) ?? 0;
      week.push({ date, key, count, level: activityLevel(count), future: date > end });
      cursor.setDate(cursor.getDate() + 1);
    }
    out.push(week);
  }
  return out;
}
