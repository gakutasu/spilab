import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Evaluation } from '../types';
import { getQuestion, questions } from '../questions';
import { topicLabel, type TopicId } from '../questions/topics';
import { computeTopicStats } from '../core/stats';
import { isComplete } from '../core/session';
import { useAnswers } from '../hooks/useAnswers';
import { clearSession, loadSession } from '../storage/sessionStore';
import { formatSeconds } from '../utils/format';

const GROUPS: Array<{ key: Evaluation; title: string }> = [
  { key: 'strong', title: '得意' },
  { key: 'weak', title: '要復習' },
  { key: 'normal', title: '普通' },
  { key: 'unrated', title: '未評価' },
];

export function SummaryPage() {
  const navigate = useNavigate();
  const { answers, loading } = useAnswers();
  const session = loadSession();

  const topicGroups = useMemo(() => {
    if (!session) return new Map<Evaluation, TopicId[]>();
    const topicStats = computeTopicStats(questions, answers);
    const todayTopics = new Set<TopicId>();
    for (const id of session.questionIds) {
      const q = getQuestion(id);
      if (q) todayTopics.add(q.topic);
    }
    const groups = new Map<Evaluation, TopicId[]>();
    for (const topic of todayTopics) {
      const ev = topicStats.get(topic)!.evaluation;
      groups.set(ev, [...(groups.get(ev) ?? []), topic]);
    }
    return groups;
  }, [session, answers]);

  if (!session || !isComplete(session) || session.results.length === 0) {
    return (
      <div className="page">
        <p className="muted">今日の結果はまだありません。</p>
        <Link to="/" className="btn btn-primary">
          ホームへ戻る
        </Link>
      </div>
    );
  }

  const results = session.results;
  const correct = results.filter((r) => r.result === 'correct').length;
  const incorrect = results.filter((r) => r.result === 'incorrect').length;
  const unknown = results.filter((r) => r.result === 'unknown').length;
  const avgMs = results.reduce((s, r) => s + r.answerTimeMs, 0) / results.length;

  const finish = () => {
    clearSession();
    navigate('/');
  };

  return (
    <div className="page summary">
      <h1>今日の結果</h1>
      <section className="card">
        <p className="summary-headline">
          {results.length}問中{correct}問正解
        </p>
        <div className="stat-grid">
          <div className="stat">
            <span className="stat-label">正解</span>
            <span className="stat-value ok">{correct}</span>
          </div>
          <div className="stat">
            <span className="stat-label">不正解</span>
            <span className="stat-value ng">{incorrect}</span>
          </div>
          <div className="stat">
            <span className="stat-label">わからない</span>
            <span className="stat-value unknown">{unknown}</span>
          </div>
        </div>
        <p>平均解答時間：{formatSeconds(avgMs, 0)}</p>
      </section>

      <section className="card">
        <h2>今日出題した分野の評価</h2>
        {loading ? (
          <p className="muted">集計中…</p>
        ) : (
          GROUPS.filter((g) => (topicGroups.get(g.key) ?? []).length > 0).map((g) => (
            <div key={g.key} className="topic-group">
              <h3 className={`eval-${g.key}`}>{g.title}</h3>
              <ul>
                {topicGroups.get(g.key)!.map((t) => (
                  <li key={t}>{topicLabel(t)}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <div className="actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={finish}>
          ホームへ戻る
        </button>
        <Link to="/history" className="btn btn-link">
          学習履歴を見る
        </Link>
      </div>
    </div>
  );
}
