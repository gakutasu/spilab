import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Question } from '../types';
import { TOPIC_IDS, TOPICS, CATEGORY_LABEL, topicLabel, type TopicId } from '../questions/topics';
import { useQuestionBank } from '../questions/bank';
import { useSettings } from '../hooks/useSettings';
import { useAnswers } from '../hooks/useAnswers';
import { computeTopicStats } from '../core/stats';
import { EVALUATION_LABEL } from '../core/evaluation';
import { createClient, describeApiError, generateQuestions, verifyQuestion, type GeneratedDraft } from '../ai/generate';
import { modelOption } from '../ai/models';
import { addGeneratedQuestions, deleteGeneratedQuestion, getApiKey } from '../storage/db';
import { ChoiceList } from '../components/ChoiceList';
import { QuestionBody } from '../components/QuestionBody';
import { Explanation } from '../components/Explanation';
import { CHOICE_LABELS } from '../utils/format';

type DraftStatus = 'pending' | 'saved' | 'discarded';
interface DraftItem extends GeneratedDraft {
  status: DraftStatus;
  verifyError?: string;
}

const COUNT_OPTIONS = [1, 2, 3, 5] as const;

export function GeneratePage() {
  const bank = useQuestionBank();
  const { settings } = useSettings();
  const { answers } = useAnswers();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [topic, setTopic] = useState<TopicId | 'auto'>('auto');
  const [count, setCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'auto' | 1 | 2 | 3>('auto');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState('');
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getApiKey().then(setApiKey);
  }, []);

  const topicStats = useMemo(() => computeTopicStats(bank.questions, answers), [bank.questions, answers]);

  const resolveTopic = (): TopicId => {
    if (topic !== 'auto') return topic;
    const weak = [...topicStats.values()].filter((t) => t.evaluation === 'weak').sort((a, b) => a.score - b.score)[0];
    if (weak) return weak.topic;
    const counts = new Map(TOPIC_IDS.map((t) => [t, bank.questions.filter((q) => q.topic === t).length]));
    return [...counts.entries()].sort((a, b) => a[1] - b[1])[0]![0];
  };

  const run = async () => {
    if (!apiKey) return;
    const target = resolveTopic();
    const model = settings.aiModel;
    const client = createClient(apiKey);
    const inTopic = bank.questions.filter((q) => q.topic === target);
    const examples = [...inTopic.filter((q) => q.source !== 'ai'), ...inTopic.filter((q) => q.source === 'ai')].slice(0, 2);
    const existingStems = inTopic.map((q) => q.question.split('\n')[0]!.slice(0, 40)).slice(0, 80);

    setRunning(true);
    setError(null);
    setErrors([]);
    setDrafts([]);
    setProgress(`${topicLabel(target)}の問題を${count}問 生成中…（${modelOption(model).label.split('（')[0]}。1〜3分かかることがあります）`);
    try {
      const result = await generateQuestions(client, { model, topic: target, count, difficulty: difficulty === 'auto' ? null : difficulty, examples, existingStems });
      setErrors(result.errors);
      const items: DraftItem[] = result.drafts.map((d) => ({ ...d, status: 'pending' }));
      setDrafts(items);
      if (settings.aiVerify) {
        for (let i = 0; i < items.length; i++) {
          setProgress(`検算中… ${i + 1} / ${items.length}`);
          try {
            const verification = await verifyQuestion(client, model, items[i]!.question);
            setDrafts((prev) => prev.map((d, j) => (j === i ? { ...d, verification } : d)));
          } catch (e) {
            const message = describeApiError(e);
            setDrafts((prev) => prev.map((d, j) => (j === i ? { ...d, verifyError: message } : d)));
          }
        }
      }
    } catch (e) {
      setError(describeApiError(e));
    } finally {
      setRunning(false);
      setProgress('');
    }
  };

  const save = async (index: number) => {
    const item = drafts[index];
    if (!item) return;
    await addGeneratedQuestions([item.question]);
    await bank.reload();
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, status: 'saved' } : d)));
  };

  const discard = (index: number) => {
    setDrafts((prev) => prev.map((d, i) => (i === index ? { ...d, status: 'discarded' } : d)));
  };

  const saveAllAgreed = async () => {
    const targets = drafts.filter((d) => d.status === 'pending' && d.verification?.agrees);
    if (targets.length === 0) return;
    await addGeneratedQuestions(targets.map((d) => d.question));
    await bank.reload();
    const ids = new Set(targets.map((d) => d.question.id));
    setDrafts((prev) => prev.map((d) => (ids.has(d.question.id) ? { ...d, status: 'saved' } : d)));
  };

  const removeSaved = async (q: Question) => {
    if (!window.confirm('このAI生成問題を削除しますか？')) return;
    await deleteGeneratedQuestion(q.id);
    await bank.reload();
  };

  const agreedPending = drafts.filter((d) => d.status === 'pending' && d.verification?.agrees).length;
  const generatedByTopic = useMemo(() => {
    const map = new Map<TopicId, Question[]>();
    for (const q of bank.generated) map.set(q.topic, [...(map.get(q.topic) ?? []), q]);
    return map;
  }, [bank.generated]);

  return (
    <div className="page generate">
      <h1>AIで問題を作る</h1>

      {apiKey === '' && (
        <section className="card">
          <p>
            AI生成を使うには、<Link to="/settings">設定画面</Link>でAnthropic APIキーを保存してください。
          </p>
        </section>
      )}

      <section className="card">
        <h2>生成条件</h2>
        <label className="field">
          <span>分野</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value as TopicId | 'auto')} disabled={running}>
            <option value="auto">おまかせ（苦手分野・問題が少ない分野）</option>
            {TOPIC_IDS.map((t) => {
              const s = topicStats.get(t)!;
              return (
                <option key={t} value={t}>
                  {CATEGORY_LABEL[TOPICS[t].category]} / {TOPICS[t].label}（{EVALUATION_LABEL[s.evaluation]}・{bank.questions.filter((q) => q.topic === t).length}問）
                </option>
              );
            })}
          </select>
        </label>
        <div className="field-row">
          <label className="field">
            <span>作成数</span>
            <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={running}>
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}問
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>難易度</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as 1 | 2 | 3))}
              disabled={running}
            >
              <option value="auto">混合</option>
              <option value={1}>1（易しい）</option>
              <option value={2}>2（標準）</option>
              <option value={3}>3（難しい）</option>
            </select>
          </label>
        </div>
        <p className="muted small">
          モデル：{modelOption(settings.aiModel).label}／検算：{settings.aiVerify ? 'あり' : 'なし'}（設定画面で変更）
        </p>
        <div className="actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => void run()} disabled={running || !apiKey}>
            {running ? '生成中…' : '生成する'}
          </button>
        </div>
        {progress && <p className="notice">{progress}</p>}
        {error && <p className="notice ng">{error}</p>}
        {errors.length > 0 && (
          <div className="notice ng">
            <p>形式が不正だった問題は除外しました：</p>
            <ul>
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {drafts.length > 0 && (
        <section className="drafts">
          <div className="session-header">
            <h2>生成結果（{drafts.length}問）</h2>
            {agreedPending > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => void saveAllAgreed()}>
                検算一致の{agreedPending}問を保存
              </button>
            )}
          </div>
          <p className="muted small">内容を確認してから保存してください。保存した問題は今日の出題・履歴の対象になります。</p>
          {drafts.map((d, i) => (
            <DraftCard key={d.question.id} item={d} verifying={running && settings.aiVerify} onSave={() => void save(i)} onDiscard={() => discard(i)} />
          ))}
        </section>
      )}

      <section className="card">
        <h2>保存済みのAI生成問題（{bank.generated.length}件）</h2>
        {bank.generated.length === 0 ? (
          <p className="muted">まだありません。</p>
        ) : (
          [...generatedByTopic.entries()].map(([t, list]) => (
            <details key={t} className="topic-details">
              <summary>
                {topicLabel(t)}（{list.length}件）
              </summary>
              <ul className="generated-list">
                {list.map((q) => (
                  <li key={q.id}>
                    <Link to={`/history/${q.id}`}>{q.question.split('\n')[0]?.slice(0, 40)}…</Link>
                    <button type="button" className="btn btn-link small" onClick={() => void removeSaved(q)}>
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          ))
        )}
      </section>
    </div>
  );
}

function DraftCard({ item, verifying, onSave, onDiscard }: { item: DraftItem; verifying: boolean; onSave: () => void; onDiscard: () => void }) {
  const q = item.question;
  const v = item.verification;
  const statusClass = item.status === 'saved' ? 'is-saved' : item.status === 'discarded' ? 'is-discarded' : '';
  return (
    <article className={`card draft-card ${statusClass}`}>
      <div className="session-header">
        <span className="topic-badge">
          【{topicLabel(q.topic)}】<span className="muted small">難易度{q.difficulty}・目安{q.recommendedTime}秒</span>
        </span>
        {v ? (
          v.agrees ? (
            <span className="badge badge-correct">検算一致（{v.confidence}）</span>
          ) : (
            <span className="badge badge-incorrect">検算不一致：検算者は{CHOICE_LABELS[v.answerIndex] ?? '?'}</span>
          )
        ) : item.verifyError ? (
          <span className="badge badge-unknown">検算失敗</span>
        ) : verifying ? (
          <span className="badge badge-unrated">検算待ち</span>
        ) : (
          <span className="badge badge-unrated">未検算</span>
        )}
      </div>
      <QuestionBody question={q} />
      <ChoiceList question={q} selected={q.correctChoice} disabled revealed onSelect={() => undefined} />
      {v && !v.agrees && (
        <p className="notice ng">
          検算者の判断：{v.reasoning}
          {v.issues && ` ／ 指摘：${v.issues}`}
        </p>
      )}
      {v && v.agrees && v.issues && <p className="notice">指摘：{v.issues}</p>}
      {item.verifyError && <p className="notice ng">{item.verifyError}</p>}
      <details>
        <summary>解説</summary>
        <Explanation text={q.explanation} />
      </details>
      {item.selfCheck && (
        <details>
          <summary>作成時の自己検算</summary>
          <p className="small">{item.selfCheck}</p>
        </details>
      )}
      <div className="actions actions-row">
        {item.status === 'pending' ? (
          <>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              保存
            </button>
            <button type="button" className="btn btn-secondary" onClick={onDiscard}>
              破棄
            </button>
          </>
        ) : (
          <span className="muted">{item.status === 'saved' ? '保存しました' : '破棄しました'}</span>
        )}
      </div>
    </article>
  );
}
