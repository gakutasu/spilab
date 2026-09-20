import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { questions } from '../questions';
import { CATEGORY_LABEL, topicLabel } from '../questions/topics';
import type { Category } from '../types';
import { computeAllQuestionStats, computeOverallStats, computeTopicStats } from '../core/stats';
import { useAnswers } from '../hooks/useAnswers';
import { useSettings } from '../hooks/useSettings';
import { analyzeTopics, forecastNextSession, recentTrend } from '../core/analysis';
import { ForecastPanel, TopicBars, TrendNote } from '../components/TopicOverview';
import { EvalBadge } from '../components/EvalBadge';
import { formatPercent, formatSeconds } from '../utils/format';

export function HistoryPage() {
  const { answers, loading } = useAnswers();
  const { settings } = useSettings();
  const [tab, setTab] = useState<Category>('nonverbal');
  const insights = useMemo(() => analyzeTopics(questions, answers), [answers]);
  const forecast = useMemo(
    () => forecastNextSession(questions, answers, settings.questionsPerDay, new Date(), 100, { formats: settings.formats, includeEnglish: settings.includeEnglish }),
    [answers, settings],
  );
  const trend = useMemo(() => recentTrend(answers), [answers]);

  const overall = useMemo(() => computeOverallStats(questions, answers), [answers]);
  const topics = useMemo(() => [...computeTopicStats(questions, answers).values()], [answers]);
  const answered = useMemo(() => {
    const stats = computeAllQuestionStats(questions, answers);
    return questions
      .map((q) => ({ question: q, stats: stats.get(q.id)! }))
      .filter((x) => x.stats.attemptCount > 0)
      .sort((a, b) => a.stats.masteryScore - b.stats.masteryScore || b.stats.attemptCount - a.stats.attemptCount);
  }, [answers]);

  if (loading) return <div className="page muted">読み込み中…</div>;

  if (overall.attemptCount === 0) {
    return (
      <div className="page">
        <h1>学習履歴</h1>
        <p className="muted">まだ回答がありません。</p>
        <Link to="/session" className="btn btn-primary">
          今日のSPIを始める
        </Link>
      </div>
    );
  }

  return (
    <div className="page history">
      <h1>学習履歴</h1>

      <section className="card">
        <h2>全体</h2>
        <div className="stat-grid">
          <div className="stat">
            <span className="stat-label">総回答数</span>
            <span className="stat-value">{overall.attemptCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">総正解数</span>
            <span className="stat-value ok">{overall.correctCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">正答率</span>
            <span className="stat-value">{formatPercent(overall.correctRate)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">わからない率</span>
            <span className="stat-value unknown">{formatPercent(overall.unknownRate)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">平均解答時間</span>
            <span className="stat-value">{formatSeconds(overall.averageAnswerTimeMs, 0)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">学習日数</span>
            <span className="stat-value">{overall.studyDays}</span>
          </div>
        </div>
        <p className="muted small">
          解いた問題 {overall.answeredQuestionCount} / 総問題数 {overall.questionCount}問
        </p>
      </section>

      <section className="card">
        <h2>分析</h2>
        <TrendNote trend={trend} />
        <TopicBars insights={insights} />
      </section>

      <section className="card">
        <h2>次回の出題傾向</h2>
        <ForecastPanel forecast={forecast} count={settings.questionsPerDay} />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>分野別</h2>
          <span className="muted small">
            解いた問題 {overall.answeredQuestionCount} / {overall.questionCount}問
          </span>
        </div>
        <div className="tabs" role="tablist">
          {(settings.includeEnglish ? (['verbal', 'nonverbal', 'english'] as Category[]) : (['verbal', 'nonverbal'] as Category[])).map((c) => (
            <button key={c} type="button" role="tab" aria-selected={tab === c} className={`tab${tab === c ? ' is-active' : ''}`} onClick={() => setTab(c)}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>分野</th>
                <th className="num">問題数</th>
                <th className="num">回答数</th>
                <th className="num">正答率</th>
                <th className="num">わからない率</th>
                <th className="num">平均時間</th>
                <th className="num">目安</th>
                <th>評価</th>
              </tr>
            </thead>
            <tbody>
              {topics
                .filter((t) => t.category === tab)
                .map((t) => (
                  <tr key={t.topic}>
                    <td>{topicLabel(t.topic)}</td>
                    <td className="num">
                      {t.answeredQuestionCount} / {t.questionCount}
                    </td>
                    <td className="num">{t.attemptCount}</td>
                    <td className="num">{t.attemptCount ? formatPercent(t.correctRate) : '-'}</td>
                    <td className="num">{t.attemptCount ? formatPercent(t.unknownRate) : '-'}</td>
                    <td className="num">{t.attemptCount ? formatSeconds(t.averageAnswerTimeMs, 0) : '-'}</td>
                    <td className="num">{t.attemptCount ? formatSeconds(t.averageRecommendedTimeMs, 0) : '-'}</td>
                    <td>
                      <EvalBadge evaluation={t.evaluation} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">問題数 = 解いた問題 / その分野の問題数</p>
      </section>

      <section className="card">
        <h2>問題別</h2>
        <p className="muted small">習熟度（masteryScore）が低い順。問題を押すと詳細を表示します。</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>問題</th>
                <th className="num">回答</th>
                <th className="num">正答率</th>
                <th className="num">習熟度</th>
                <th>評価</th>
              </tr>
            </thead>
            <tbody>
              {answered.map(({ question, stats }) => (
                <tr key={question.id}>
                  <td className="question-cell">
                    <Link to={`/history/${question.id}`}>
                      【{topicLabel(question.topic)}】{question.question.split('\n')[0]?.slice(0, 24)}…
                    </Link>
                  </td>
                  <td className="num">{stats.attemptCount}</td>
                  <td className="num">{formatPercent(stats.correctRate)}</td>
                  <td className="num">{stats.masteryScore}</td>
                  <td>
                    <EvalBadge evaluation={stats.evaluation} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
