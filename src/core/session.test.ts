import type { Question } from '../types';
import { createSession, startQuestion, selectChoice, submitAnswer, nextQuestion, isComplete, currentQuestionId } from './session';

const q: Question = {
  id: 'q1',
  category: 'nonverbal',
  topic: 'permutation',
  difficulty: 1,
  question: 'q',
  choices: ['a', 'b', 'c', 'd'],
  correctChoice: 2,
  recommendedTime: 30,
  explanation: 'x'.repeat(50),
  tags: [],
};

describe('session transitions', () => {
  it('creates a ready session', () => {
    const s = createSession(['q1', 'q2'], '2026-09-18');
    expect(s.phase).toBe('ready');
    expect(s.currentIndex).toBe(0);
    expect(currentQuestionId(s)).toBe('q1');
    expect(isComplete(s)).toBe(false);
  });

  it('starts the timer and tracks the selected choice', () => {
    let s = startQuestion(createSession(['q1'], '2026-09-18'), 1000);
    expect(s.phase).toBe('answering');
    expect(s.startedAt).toBe(1000);
    s = selectChoice(s, 2);
    expect(s.selectedChoice).toBe(2);
  });

  it('grades a correct answer and produces a record', () => {
    let s = startQuestion(createSession(['q1'], '2026-09-18'), 1000);
    s = selectChoice(s, 2);
    const { session, record } = submitAnswer(s, q, 33400, new Date('2026-09-18T00:00:00.000Z'));
    expect(session.phase).toBe('answered');
    expect(record).toEqual({
      questionId: 'q1',
      timestamp: '2026-09-18T00:00:00.000Z',
      selectedChoice: 2,
      result: 'correct',
      answerTimeMs: 32400,
    });
    expect(session.results).toHaveLength(1);
    expect(session.lastResult?.result).toBe('correct');
  });

  it('grades incorrect and unknown answers', () => {
    const s = startQuestion(createSession(['q1'], '2026-09-18'), 1000);
    expect(submitAnswer(selectChoice(s, 0), q, 2000, new Date()).record.result).toBe('incorrect');
    const unknown = submitAnswer(s, q, 2000, new Date(), true).record;
    expect(unknown.result).toBe('unknown');
    expect(unknown.selectedChoice).toBeNull();
  });

  it('advances and completes', () => {
    let s = startQuestion(createSession(['q1', 'q2'], '2026-09-18'), 1000);
    s = submitAnswer(selectChoice(s, 2), q, 2000, new Date()).session;
    s = nextQuestion(s);
    expect(s.currentIndex).toBe(1);
    expect(s.phase).toBe('ready');
    expect(s.startedAt).toBeNull();
    s = submitAnswer(startQuestion(s, 3000), q, 4000, new Date()).session;
    s = nextQuestion(s);
    expect(isComplete(s)).toBe(true);
    expect(currentQuestionId(s)).toBeNull();
  });
});
