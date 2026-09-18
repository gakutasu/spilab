import { useMemo } from 'react';
import type { AnswerRecord } from '../types';
import { heatmapWeeks } from '../core/activity';

const WEEKDAY = ['日', '月', '火', '水', '木', '金', '土'];

export function ActivityHeatmap({ records, weeks = 20 }: { records: AnswerRecord[]; weeks?: number }) {
  const grid = useMemo(() => heatmapWeeks(records, weeks), [records, weeks]);
  const monthLabels = grid.map((week, i) => {
    const first = week[0]!.date;
    const prev = grid[i - 1]?.[0]?.date;
    const show = i === 0 || (prev && prev.getMonth() !== first.getMonth());
    return show ? `${first.getMonth() + 1}月` : '';
  });

  return (
    <div className="heatmap" role="img" aria-label="直近の学習活動">
      <div className="heatmap-months">
        {monthLabels.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
      <div className="heatmap-body">
        <div className="heatmap-days">
          {WEEKDAY.map((d, i) => (
            <span key={d} className={i % 2 === 1 ? '' : 'is-hidden'}>
              {d}
            </span>
          ))}
        </div>
        <div className="heatmap-grid">
          {grid.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((c) => (
                <span
                  key={c.key}
                  className={`heatmap-cell level-${c.level}${c.future ? ' is-future' : ''}`}
                  title={c.future ? '' : `${c.key}：${c.count}問`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>少</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`heatmap-cell level-${l}`} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
