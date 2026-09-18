import { Link } from 'react-router-dom';
import type { Evaluation } from '../types';
import { CATEGORY_LABEL } from '../questions/topics';
import { EVALUATION_LABEL } from '../core/evaluation';
import type { Forecast, TopicInsight, Trend } from '../core/analysis';
import { formatPercent } from '../utils/format';

const KIND_LABEL: Record<TopicInsight['kind'], string> = {
  unlearned: '解法未習得',
  weak: '苦手',
  slow: '正解だが遅い',
  unrated: '未評価',
  normal: '普通',
  strong: '得意',
};

export function TopicBars({ insights, compact = false }: { insights: TopicInsight[]; compact?: boolean }) {
  if (insights.length === 0) return <p className="muted">まだ回答がありません。今日の問題を解くと、ここに得意・苦手が表示されます。</p>;
  const list = compact ? insights.slice(0, 6) : insights;
  return (
    <ul className="topic-bars">
      {list.map((i) => (
        <li key={i.topic} className={`topic-bar kind-${i.kind}`}>
          <div className="topic-bar-head">
            <span className="topic-bar-name">
              {i.label} <span className="muted small">{CATEGORY_LABEL[i.stats.category]}</span>
            </span>
            <span className={`badge badge-${i.evaluation}`}>{KIND_LABEL[i.kind]}</span>
          </div>
          <div className="bar" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${i.score}%` }} />
          </div>
          {!compact && <p className="topic-bar-note small">{i.message}</p>}
        </li>
      ))}
    </ul>
  );
}

export function InsightList({ insights, limit = 3 }: { insights: TopicInsight[]; limit?: number }) {
  const focus = insights.filter((i) => i.kind !== 'strong' && i.kind !== 'unrated').slice(0, limit);
  const strong = insights.filter((i) => i.kind === 'strong').slice(0, 3);
  if (focus.length === 0 && strong.length === 0) {
    return <p className="insights small muted">各分野 3 回以上回答すると、得意・苦手の判定と重点ポイントが表示されます。</p>;
  }
  return (
    <div className="insights">
      {focus.length > 0 && (
        <>
          <h3>重点ポイント</h3>
          <ul>
            {focus.map((i) => (
              <li key={i.topic}>
                <strong>{i.label}</strong>：{i.message}
              </li>
            ))}
          </ul>
        </>
      )}
      {strong.length > 0 && (
        <p className="small">
          <strong>得意：</strong>
          {strong.map((i) => i.label).join('、')}
        </p>
      )}
    </div>
  );
}

const BUCKET_ORDER: Evaluation[] = ['weak', 'normal', 'unrated', 'strong'];

export function ForecastPanel({ forecast, count }: { forecast: Forecast; count: number }) {
  if (forecast.topics.length === 0) return null;
  const top = forecast.topics.slice(0, 5);
  return (
    <div className="forecast">
      <p className="small muted">次回の{count}問で出やすい分野（出題アルゴリズムを100回試行した平均）</p>
      <ul className="forecast-topics">
        {top.map((t) => (
          <li key={t.topic}>
            <span className="forecast-name">{t.label}</span>
            <span className={`badge badge-${t.evaluation}`}>{EVALUATION_LABEL[t.evaluation]}</span>
            <span className="forecast-share">{formatPercent(t.share)}</span>
          </li>
        ))}
      </ul>
      <div className="bucket-bar" aria-label="出題の内訳">
        {BUCKET_ORDER.filter((b) => forecast.buckets[b] > 0).map((b) => (
          <span key={b} className={`bucket bucket-${b}`} style={{ width: `${forecast.buckets[b] * 100}%` }} title={`${EVALUATION_LABEL[b]} ${formatPercent(forecast.buckets[b])}`}>
            {forecast.buckets[b] >= 0.12 ? `${EVALUATION_LABEL[b]} ${formatPercent(forecast.buckets[b])}` : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TrendNote({ trend }: { trend: Trend | null }) {
  if (!trend) return null;
  const diff = trend.recentRate - trend.previousRate;
  const word = diff > 0.1 ? '上昇中' : diff < -0.1 ? '下降中' : '横ばい';
  return (
    <p className="small muted">
      直近{trend.recentCount}問の正答率 {formatPercent(trend.recentRate)}（その前{trend.previousCount}問：{formatPercent(trend.previousRate)}）→ {word}
    </p>
  );
}

export function OverviewLink() {
  return (
    <Link to="/history" className="btn btn-link">
      分野ごとの詳細を見る
    </Link>
  );
}
