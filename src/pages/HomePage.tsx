import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { questions } from '../questions';
import { computeOverallStats, computeTopicStats } from '../core/stats';
import { isComplete } from '../core/session';
import { useAnswers } from '../hooks/useAnswers';
import { useSettings } from '../hooks/useSettings';
import { clearSession, loadSession } from '../storage/sessionStore';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { topicLabel } from '../questions/topics';
import { formatPercent } from '../utils/format';

export function HomePage() {
  const navigate = useNavigate();
  const { answers, loading } = useAnswers();
  const { settings } = useSettings();
  const session = loadSession();
  const inProgress = session && !isComplete(session);
  const finished = session && isComplete(session);

  const overall = useMemo(() => computeOverallStats(questions, answers), [answers]);
  const topics = useMemo(() => [...computeTopicStats(questions, answers).values()], [answers]);
  const strong = topics.filter((t) => t.evaluation === 'strong');
  const weak = topics.filter((t) => t.evaluation === 'weak').sort((a, b) => a.score - b.score);
  const normal = topics.filter((t) => t.evaluation === 'normal');

  const startNew = () => {
    clearSession();
    navigate('/session');
  };

  return (
    <div className="page home">
      <section className="hero">
        <p className="hero-kicker">転職向け SPI 対策</p>
        <h1>今日も、苦手をひとつ潰す。</h1>
        <p className="lead">1問ずつ解いて、間違えた分野・わからなかった分野から優先的に出題。</p>
        {inProgress ? (
          <>
            <button type="button" className="btn btn-primary btn-lg btn-hero" onClick={() => navigate('/session')}>
              続きから（{session.currentIndex + 1} / {session.questionIds.length}問目）
            </button>
            <button type="button" className="btn btn-link" onClick={startNew}>
              今日の問題を作り直す
            </button>
          </>
        ) : finished ? (
          <>
            <button type="button" className="btn btn-primary btn-lg btn-hero" onClick={() => navigate('/summary')}>
              今日の結果を見る
            </button>
            <button type="button" className="btn btn-secondary" onClick={startNew}>
              もう{settings.questionsPerDay}問 解く
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-lg btn-hero" onClick={() => navigate('/session')}>
            今日のSPIを始める（{settings.questionsPerDay}問）
          </button>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>学習の記録</h2>
          {!loading && (
            <span className="muted small">
              通算 {overall.studyDays}日 / {overall.attemptCount}問
            </span>
          )}
        </div>
        <ActivityHeatmap records={answers} />
      </section>

      {!loading && overall.attemptCount > 0 && (
        <section className="card">
          <div className="card-head">
            <h2>いまの状態</h2>
            <span className="muted small">正答率 {formatPercent(overall.correctRate)}</span>
          </div>
          <div className="status-chips">
            <Link to="/history" className="chip chip-strong">
              <span className="chip-num">{strong.length}</span>得意
            </Link>
            <Link to="/history" className="chip chip-normal">
              <span className="chip-num">{normal.length}</span>普通
            </Link>
            <Link to="/history" className="chip chip-weak">
              <span className="chip-num">{weak.length}</span>苦手
            </Link>
          </div>
          {weak.length > 0 ? (
            <p className="status-note">
              次の重点：<strong>{weak.slice(0, 3).map((t) => topicLabel(t.topic)).join('・')}</strong>
            </p>
          ) : (
            <p className="status-note muted">各分野3回以上解くと得意・苦手が確定します。</p>
          )}
          <Link to="/history" className="btn btn-link">
            分析と次回の出題傾向を見る
          </Link>
        </section>
      )}
    </div>
  );
}
