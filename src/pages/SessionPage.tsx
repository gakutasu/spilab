import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AnswerRecord, Question } from '../types';
import { getQuestion, questions } from '../questions';
import { CATEGORY_LABEL, topicLabel } from '../questions/topics';
import { selectQuestions } from '../core/selection';
import { randomRng } from '../core/rng';
import { computeTopicStats } from '../core/stats';
import { buildFeedback, type Feedback } from '../core/feedback';
import { timeBand, timeRatio, TIME_BAND_LABEL } from '../core/timeRatio';
import { createSession, currentQuestionId, isComplete, nextQuestion, selectChoice, startQuestion, submitAnswer } from '../core/session';
import { useAnswers } from '../hooks/useAnswers';
import { useSettings } from '../hooks/useSettings';
import { useElapsed } from '../hooks/useElapsed';
import { useSync } from '../hooks/useSync';
import { addAnswer } from '../storage/db';
import { clearSession, loadSession, saveSession, type ActiveSession, type SessionResult } from '../storage/sessionStore';
import { ChoiceList } from '../components/ChoiceList';
import { QuestionBody } from '../components/QuestionBody';
import { Explanation } from '../components/Explanation';
import { AskAiPanel } from '../components/AskAiPanel';
import { CHOICE_LABELS, formatClock, formatSeconds, todayKey } from '../utils/format';

function feedbackFor(
  questions: Question[],
  question: Question,
  result: SessionResult,
  before: AnswerRecord[],
  after: AnswerRecord[],
): Feedback {
  const b = computeTopicStats(questions, before).get(question.topic)!;
  const a = computeTopicStats(questions, after).get(question.topic)!;
  return buildFeedback({
    result: result.result,
    answerTimeMs: result.answerTimeMs,
    recommendedTime: question.recommendedTime,
    topicLabel: topicLabel(question.topic),
    topicEvalBefore: b.evaluation,
    topicEvalAfter: a.evaluation,
    topicScoreBefore: b.score,
    topicScoreAfter: a.score,
  });
}

/** Drops the most recent record for the question so "before" stats can be rebuilt after a reload. */
function withoutLatest(records: AnswerRecord[], questionId: string): AnswerRecord[] {
  let latestIndex = -1;
  records.forEach((r, i) => {
    if (r.questionId === questionId && (latestIndex === -1 || r.timestamp > records[latestIndex]!.timestamp)) latestIndex = i;
  });
  return latestIndex === -1 ? records : records.filter((_, i) => i !== latestIndex);
}

export function SessionPage() {
  const navigate = useNavigate();
  const { answers, loading, reload } = useAnswers();
  const { settings, loading: settingsLoading } = useSettings();
  const { afterAnswer } = useSync();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (loading || settingsLoading || initialized.current) return;
    initialized.current = true;
    const existing = loadSession();
    if (existing && isComplete(existing)) {
      navigate('/summary', { replace: true });
      return;
    }
    if (existing) {
      setSession(existing);
      return;
    }
    const picked = selectQuestions({ questions, records: answers, count: settings.questionsPerDay, now: new Date(), rng: randomRng });
    if (picked.length === 0) {
      setError('出題できる問題がありません。');
      return;
    }
    const fresh = createSession(picked.map((q) => q.id), todayKey());
    saveSession(fresh);
    setSession(fresh);
  }, [loading, settingsLoading, answers, settings.questionsPerDay, navigate]);

  const questionId = session ? currentQuestionId(session) : null;
  const question = questionId ? getQuestion(questionId) : undefined;

  // Rebuild feedback after a reload in the answered phase.
  useEffect(() => {
    if (!session || session.phase !== 'answered' || !question || !session.lastResult || feedback) return;
    setFeedback(feedbackFor(questions, question, session.lastResult, withoutLatest(answers, question.id), answers));
  }, [session, question, answers, feedback]);

  const update = useCallback((next: ActiveSession) => {
    saveSession(next);
    setSession(next);
  }, []);

  const elapsed = useElapsed(session?.phase === 'answering' ? session.startedAt : null);

  const submit = async (unknown: boolean) => {
    if (!session || !question) return;
    const { session: next, record } = submitAnswer(session, question, Date.now(), new Date(), unknown);
    const after = [...answers, record];
    setFeedback(feedbackFor(questions, question, next.lastResult!, answers, after));
    update(next);
    await addAnswer(record);
    afterAnswer(record);
    await reload();
  };

  const goNext = () => {
    if (!session) return;
    const next = nextQuestion(session);
    setFeedback(null);
    if (isComplete(next)) {
      saveSession(next);
      navigate('/summary');
    } else {
      update(next);
    }
  };

  const ratioInfo = useMemo(() => {
    if (!session?.lastResult || !question) return null;
    const ratio = timeRatio(session.lastResult.answerTimeMs, question.recommendedTime);
    return { ratio, band: timeBand(ratio) };
  }, [session?.lastResult, question]);

  if (error) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <Link to="/" className="btn btn-secondary">
          ホームへ戻る
        </Link>
      </div>
    );
  }
  if (!session || !question) {
    return <div className="page muted">読み込み中…</div>;
  }
  if (session.questionIds.some((id) => !getQuestion(id))) {
    // Question bank changed since the session was created; start over.
    return (
      <div className="page">
        <p className="error">問題データが更新されたため、この回は続行できません。</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            clearSession();
            navigate('/');
          }}
        >
          ホームへ戻る
        </button>
      </div>
    );
  }

  const isLast = session.currentIndex === session.questionIds.length - 1;
  const last = session.lastResult;

  return (
    <div className="page session">
      <div className="session-header">
        <span className="progress">
          問題 {session.currentIndex + 1} / {session.questionIds.length}
        </span>
        <span className="topic-badge">【{topicLabel(question.topic)}】</span>
      </div>

      {session.phase === 'ready' && (
        <div className="card ready-card">
          <p className="ready-title">{CATEGORY_LABEL[question.category]}：{topicLabel(question.topic)}</p>
          <p className="muted">目安時間：{question.recommendedTime}秒</p>
          <p className="muted small">ボタンを押すと問題が表示され、同時にタイマーが始まります。</p>
          <div className="actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => update(startQuestion(session, Date.now()))}>
              問題をはじめる
            </button>
          </div>
        </div>
      )}

      {session.phase !== 'ready' && <QuestionBody question={question} />}

      {session.phase === 'answering' && (
        <>
          <div className="timer" aria-live="off">
            経過時間 <span className="timer-value">{formatClock(elapsed)}</span>
          </div>
          <ChoiceList
            question={question}
            selected={session.selectedChoice}
            disabled={false}
            revealed={false}
            onSelect={(i) => update(selectChoice(session, i))}
          />
          <div className="actions">
            <button type="button" className="btn btn-unknown" onClick={() => void submit(true)}>
              わからない
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={session.selectedChoice === null}
              onClick={() => void submit(false)}
            >
              解答する
            </button>
          </div>
        </>
      )}

      {session.phase === 'answered' && last && (
        <>
          <ChoiceList question={question} selected={last.selectedChoice} disabled revealed onSelect={() => undefined} />
          <section className={`result-panel result-${last.result}`}>
            <h2 className="result-headline">{feedback?.headline ?? ''}</h2>
            <dl className="result-details">
              <dt>あなたの回答</dt>
              <dd>
                {last.selectedChoice === null
                  ? 'わからない'
                  : `${CHOICE_LABELS[last.selectedChoice]}. ${question.choices[last.selectedChoice]}`}
              </dd>
              <dt>正解</dt>
              <dd>
                {CHOICE_LABELS[question.correctChoice]}. {question.choices[question.correctChoice]}
              </dd>
              <dt>解答時間</dt>
              <dd>
                {formatSeconds(last.answerTimeMs)} / 目安{question.recommendedTime}秒
                {ratioInfo && last.result !== 'unknown' && (
                  <span className={`time-band time-${ratioInfo.band}`}>（{TIME_BAND_LABEL[ratioInfo.band]}）</span>
                )}
              </dd>
            </dl>
            {feedback && (
              <div className="feedback">
                {feedback.lines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h2>解説</h2>
            <Explanation text={question.explanation} />
          </section>

          <AskAiPanel question={question} selectedChoice={last.selectedChoice} result={last.result} answerTimeMs={last.answerTimeMs} />

          <div className="actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={goNext}>
              {isLast ? '結果を見る' : '次の問題'}
            </button>
          </div>
        </>
      )}

      <p className="muted small center">
        <Link to="/">いったん中断する</Link>（進行状況は保存されます）
      </p>
    </div>
  );
}
