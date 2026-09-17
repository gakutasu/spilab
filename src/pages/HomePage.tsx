import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../questions';
import { topicLabel } from '../questions/topics';
import { computeOverallStats, computeTopicStats } from '../core/stats';
import { EVALUATION_LABEL } from '../core/evaluation';
import { isComplete } from '../core/session';
import { useAnswers } from '../hooks/useAnswers';
import { useSettings } from '../hooks/useSettings';
import { clearSession, loadSession } from '../storage/sessionStore';
import { formatPercent } from '../utils/format';

export function HomePage() {
  const navigate = useNavigate();
  const { answers, loading } = useAnswers();
  const { settings } = useSettings();
  const session = loadSession();
  const inProgress = session && !isComplete(session);
  const finished = session && isComplete(session);

  const overall = useMemo(() => computeOverallStats(questions, answers), [answers]);
  const weakTopics = useMemo(() => {
    return [...computeTopicStats(questions, answers).values()]
      .filter((t) => t.evaluation === 'weak')
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [answers]);

  const startNew = () => {
    clearSession();
    navigate('/session');
  };

  return (
    <div className="page home">
      <section className="hero">
        <h1>SPILAB</h1>
        <p className="lead">1問ずつ解いて、苦手分野を優先的に練習するSPI対策アプリ。</p>
        {inProgress ? (
          <>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/session')}>
              続きから（{session.currentIndex + 1} / {session.questionIds.length}問目）
            </button>
            <button type="button" className="btn btn-link" onClick={startNew}>
              今日の問題を作り直す
            </button>
          </>
        ) : finished ? (
          <>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/summary')}>
              今日の結果を見る
            </button>
            <button type="button" className="btn btn-secondary" onClick={startNew}>
              もう一度 {settings.questionsPerDay}問 解く
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/session')}>
            今日のSPIを始める（{settings.questionsPerDay}問）
          </button>
        )}
      </section>

      {!loading && overall.attemptCount > 0 && (
        <section className="card">
          <h2>これまでの学習</h2>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-label">総回答数</span>
              <span className="stat-value">{overall.attemptCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">正答率</span>
              <span className="stat-value">{formatPercent(overall.correctRate)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">学習日数</span>
              <span className="stat-value">{overall.studyDays}</span>
            </div>
          </div>
          {weakTopics.length > 0 && (
            <p className="muted">
              重点分野：{weakTopics.map((t) => `${topicLabel(t.topic)}（${EVALUATION_LABEL[t.evaluation]}）`).join('、')}
            </p>
          )}
          <Link to="/history" className="btn btn-link">
            学習履歴を見る
          </Link>
        </section>
      )}

      <section className="card muted small">
        <p>問題数：{questions.length}問。学習履歴はこのブラウザにのみ保存されます。別の端末で続けるには設定画面から書き出してください。</p>
      </section>
    </div>
  );
}
