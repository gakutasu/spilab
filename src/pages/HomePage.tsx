import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../questions';
import { computeOverallStats } from '../core/stats';
import { analyzeTopics, forecastNextSession, recentTrend } from '../core/analysis';
import { ForecastPanel, InsightList, OverviewLink, TopicBars, TrendNote } from '../components/TopicOverview';
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
  const insights = useMemo(() => analyzeTopics(questions, answers), [answers]);
  const forecast = useMemo(() => forecastNextSession(questions, answers, settings.questionsPerDay), [answers, settings.questionsPerDay]);
  const trend = useMemo(() => recentTrend(answers), [answers]);

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
        <>
          <section className="card">
            <h2>得意・苦手</h2>
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
            <TrendNote trend={trend} />
            <TopicBars insights={insights} compact />
            <InsightList insights={insights} />
            <OverviewLink />
          </section>
          <section className="card">
            <h2>次回の出題傾向</h2>
            <ForecastPanel forecast={forecast} count={settings.questionsPerDay} />
          </section>
        </>
      )}

      <section className="card muted small">
        <p>問題数：{questions.length}問。学習履歴はこのブラウザにのみ保存されます。別の端末で続けるには設定画面から書き出してください。</p>
      </section>
    </div>
  );
}
