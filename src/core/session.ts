import type { AnswerRecord, AnswerResult, Question, SessionScope } from '../types';
import type { ActiveSession } from '../storage/sessionStore';

export function createSession(questionIds: string[], date: string, scope: SessionScope = { kind: 'all' }): ActiveSession {
  return {
    date,
    scope,
    questionIds,
    currentIndex: 0,
    phase: 'ready',
    startedAt: null,
    selectedChoice: null,
    lastResult: null,
    results: [],
  };
}

export function currentQuestionId(s: ActiveSession): string | null {
  return s.questionIds[s.currentIndex] ?? null;
}

export function isComplete(s: ActiveSession): boolean {
  return s.currentIndex >= s.questionIds.length;
}

export function startQuestion(s: ActiveSession, now: number): ActiveSession {
  return { ...s, phase: 'answering', startedAt: now, selectedChoice: null, lastResult: null };
}

export function selectChoice(s: ActiveSession, choice: number): ActiveSession {
  return { ...s, selectedChoice: choice };
}

export function submitAnswer(
  s: ActiveSession,
  question: Question,
  now: number,
  timestamp: Date,
  unknown = false,
): { session: ActiveSession; record: Omit<AnswerRecord, 'id'> } {
  const answerTimeMs = Math.max(0, now - (s.startedAt ?? now));
  const selected = unknown ? null : s.selectedChoice;
  let result: AnswerResult;
  if (unknown) result = 'unknown';
  else result = selected === question.correctChoice ? 'correct' : 'incorrect';

  const record: Omit<AnswerRecord, 'id'> = {
    questionId: question.id,
    timestamp: timestamp.toISOString(),
    selectedChoice: selected,
    result,
    answerTimeMs,
  };
  const lastResult = { questionId: question.id, result, answerTimeMs, selectedChoice: selected };
  return {
    session: { ...s, phase: 'answered', selectedChoice: selected, lastResult, results: [...s.results, lastResult] },
    record,
  };
}

export function nextQuestion(s: ActiveSession): ActiveSession {
  return { ...s, currentIndex: s.currentIndex + 1, phase: 'ready', startedAt: null, selectedChoice: null, lastResult: null };
}
