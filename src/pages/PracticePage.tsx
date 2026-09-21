import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Category, SessionScope } from '../types';
import { questions } from '../questions';
import { CATEGORIES, CATEGORY_LABEL, TOPICS, TOPIC_IDS, type TopicId } from '../questions/topics';
import { computeTopicStats } from '../core/stats';
import { useAnswers } from '../hooks/useAnswers';
import { useSettings } from '../hooks/useSettings';
import { clearSession } from '../storage/sessionStore';
import { EvalBadge } from '../components/EvalBadge';

export function PracticePage() {
  const navigate = useNavigate();
  const { answers } = useAnswers();
  const { settings } = useSettings();
  const topicStats = useMemo(() => computeTopicStats(questions, answers), [answers]);

  const start = (scope: SessionScope) => {
    clearSession();
    navigate('/session', { state: { scope } });
  };

  const categoryCount = (c: Category) => questions.filter((q) => q.category === c).length;
  const topicsOf = (c: Category): TopicId[] => TOPIC_IDS.filter((t) => TOPICS[t].category === c && topicStats.get(t)!.questionCount > 0);

  return (
    <div className="page practice">
      <h1>出題を選ぶ</h1>
      <p className="muted small">{settings.questionsPerDay}問を出題します（設定で変更可）。いつも通りの混合出題はホームから。</p>

      <section className="card">
        <h2>カテゴリで絞る</h2>
        <div className="scope-grid">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" className="btn btn-secondary scope-btn" onClick={() => start({ kind: 'category', category: c })}>
              <span className="scope-name">{CATEGORY_LABEL[c]}のみ</span>
              <span className="muted small">{categoryCount(c)}問</span>
            </button>
          ))}
        </div>
      </section>

      {CATEGORIES.map((c) => (
        <section key={c} className="card">
          <h2>{CATEGORY_LABEL[c]}の分野</h2>
          <ul className="scope-list">
            {topicsOf(c).map((t) => {
              const s = topicStats.get(t)!;
              return (
                <li key={t}>
                  <button type="button" className="scope-row" onClick={() => start({ kind: 'topic', topic: t })}>
                    <span className="scope-row-name">{TOPICS[t].label}</span>
                    <span className="scope-row-meta">
                      <span className="muted small">
                        {s.answeredQuestionCount}/{s.questionCount}問
                      </span>
                      <EvalBadge evaluation={s.evaluation} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
