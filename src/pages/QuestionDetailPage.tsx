import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuestion } from '../questions';
import { topicLabel } from '../questions/topics';
import { computeQuestionStats, sortRecords } from '../core/stats';
import { useAnswers } from '../hooks/useAnswers';
import { EvalBadge } from '../components/EvalBadge';
import { ResultBadge } from '../components/ResultBadge';
import { QuestionBody } from '../components/QuestionBody';
import { Explanation } from '../components/Explanation';
import { CHOICE_LABELS, formatDateTime, formatPercent, formatSeconds } from '../utils/format';

export function QuestionDetailPage() {
  const { questionId = '' } = useParams();
  const question = getQuestion(questionId);
  const { answers, loading } = useAnswers();

  const stats = useMemo(() => (question ? computeQuestionStats(question, answers) : null), [question, answers]);
  const history = useMemo(
    () => sortRecords(answers.filter((r) => r.questionId === questionId)).reverse(),
    [answers, questionId],
  );

  if (!question || !stats) {
    return (
      <div className="page">
        <p className="error">問題が見つかりません。</p>
        <Link to="/history" className="btn btn-secondary">
          履歴へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="page question-detail">
      <p className="small">
        <Link to="/history">← 学習履歴</Link>
      </p>
      <div className="session-header">
        <span className="topic-badge">【{topicLabel(question.topic)}】</span>
        <EvalBadge evaluation={stats.evaluation} />
      </div>
      <QuestionBody question={question} />

      <section className="card">
        <h2>この問題の記録</h2>
        <div className="stat-grid">
          <div className="stat">
            <span className="stat-label">回答回数</span>
            <span className="stat-value">{stats.attemptCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">正答率</span>
            <span className="stat-value">{formatPercent(stats.correctRate)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">わからない</span>
            <span className="stat-value unknown">{stats.unknownCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">平均時間</span>
            <span className="stat-value">{formatSeconds(stats.averageAnswerTimeMs, 0)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">目安</span>
            <span className="stat-value">{question.recommendedTime}秒</span>
          </div>
          <div className="stat">
            <span className="stat-label">習熟度</span>
            <span className="stat-value">{stats.masteryScore}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>過去の回答</h2>
        {loading ? (
          <p className="muted">読み込み中…</p>
        ) : history.length === 0 ? (
          <p className="muted">まだ回答がありません。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>日時</th>
                  <th>結果</th>
                  <th>選択</th>
                  <th className="num">時間</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r) => (
                  <tr key={r.id ?? r.timestamp}>
                    <td>{formatDateTime(r.timestamp)}</td>
                    <td>
                      <ResultBadge result={r.result} />
                    </td>
                    <td>{r.selectedChoice === null ? '-' : CHOICE_LABELS[r.selectedChoice]}</td>
                    <td className="num">{formatSeconds(r.answerTimeMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>正解と解説</h2>
        <p>
          正解：{CHOICE_LABELS[question.correctChoice]}. {question.choices[question.correctChoice]}
        </p>
        <Explanation text={question.explanation} />
      </section>
    </div>
  );
}
