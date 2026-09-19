import { useRef, useState } from 'react';
import { QUESTIONS_PER_DAY_OPTIONS } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useSync } from '../hooks/useSync';
import { useIntro } from '../hooks/useIntro';
import { AUTH_PROVIDERS } from '../storage/supabase';
import { ProviderIcon } from '../components/ProviderIcon';
import { AiSettings } from '../components/AiSettings';
import { formatDateTime } from '../utils/format';
import { clearAnswers, getAllAnswers, importAnswers } from '../storage/db';
import { clearSession } from '../storage/sessionStore';
import { buildExport, exportFileName, parseImport } from '../storage/exportImport';

type Notice = { kind: 'ok' | 'ng'; text: string } | null;

export function SettingsPage() {
  const { settings, update } = useSettings();
  const sync = useSync();
  const intro = useIntro();
  const [notice, setNotice] = useState<Notice>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const exportData = async () => {
    const answers = await getAllAnswers();
    const data = buildExport(settings, answers);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName();
    a.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: 'ok', text: `${answers.length}件の回答を書き出しました。` });
  };

  const importData = async (file: File) => {
    try {
      const data = parseImport(await file.text());
      const added = await importAnswers(data.answers);
      await update(data.settings);
      if (sync.user) void sync.syncNow();
      setNotice({ kind: 'ok', text: `${added}件の回答を追加しました（重複${data.answers.length - added}件はスキップ）。` });
    } catch (e) {
      setNotice({ kind: 'ng', text: e instanceof Error ? e.message : '読み込みに失敗しました。' });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const resetAnswers = async () => {
    const scope = sync.user ? 'このブラウザとクラウドの学習履歴' : '学習履歴';
    if (!window.confirm(`${scope}をすべて削除します。この操作は取り消せません。よろしいですか？`)) return;
    await clearAnswers();
    clearSession();
    await sync.afterAnswersCleared();
    setNotice({ kind: 'ok', text: '学習履歴を削除しました。' });
  };

  return (
    <div className="page settings">
      <h1>設定</h1>

      <section className="card">
        <h2>出題</h2>
        <label className="field">
          <span>1日の出題数</span>
          <select value={settings.questionsPerDay} onChange={(e) => void update({ ...settings, questionsPerDay: Number(e.target.value) })}>
            {QUESTIONS_PER_DAY_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}問
              </option>
            ))}
          </select>
        </label>
        <p className="muted small">次に「今日のSPIを始める」を押したときから反映されます。</p>
      </section>

      {sync.configured && (
        <section className="card">
          <h2>クラウド同期</h2>
          {sync.user ? (
            <>
              <p>
                ログイン中：{sync.user.email ?? sync.user.id}
                {sync.lastSyncAt && <span className="muted small">（最終同期 {formatDateTime(sync.lastSyncAt)}）</span>}
              </p>
              <p className="muted small">回答と設定は自動で同期されます。</p>
              <div className="actions actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => void sync.syncNow()} disabled={sync.syncing}>
                  {sync.syncing ? '同期中…' : '今すぐ同期'}
                </button>
                <button type="button" className="btn btn-link" onClick={() => void sync.signOut()}>
                  ログアウト
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="muted small">ログインすると、学習履歴を複数の端末・ブラウザで共有できます。ログインしなくても、このブラウザ内で学習できます。</p>
              <div className="actions">
                {AUTH_PROVIDERS.map((p) => (
                  <button key={p} type="button" className="btn btn-secondary btn-provider" onClick={() => void sync.signIn(p)}>
                    <ProviderIcon provider={p} />
                    {p === 'google' ? 'Googleでログイン' : 'GitHubでログイン'}
                  </button>
                ))}
              </div>
            </>
          )}
          {sync.error && <p className="notice ng">{sync.error}</p>}
        </section>
      )}

      <AiSettings />

      <section className="card">
        <h2>学習データ</h2>
        <p className="muted small">学習履歴はこのブラウザに保存されます。別の端末やブラウザで続けるには、書き出したJSONを読み込むか、クラウド同期を使ってください。</p>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={() => void exportData()}>
            学習データを書き出す（JSON）
          </button>
          <label className="field">
            <span>学習データを読み込む（JSON）</span>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importData(f);
              }}
            />
          </label>
        </div>
        {notice && <p className={`notice ${notice.kind}`}>{notice.text}</p>}
      </section>

      <section className="card">
        <h2>使い方</h2>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={intro.open}>
            はじめての案内をもう一度見る
          </button>
        </div>
      </section>

      <section className="card">
        <h2>リセット</h2>
        <div className="actions">
          <button type="button" className="btn btn-danger" onClick={() => void resetAnswers()}>
            学習履歴をすべて削除
          </button>
        </div>
      </section>

      <section className="card about">
        <h2>このアプリについて</h2>
        <p className="small">
          SPILAB v{__APP_VERSION__} — 転職向け SPI 対策の個人開発アプリ。MIT License。
        </p>
        <div className="about-links">
          <a className="about-link" href="https://github.com/gakutasu" target="_blank" rel="noreferrer">
            <ProviderIcon provider="github" />
            作者：gakutasu
          </a>
          <a className="about-link" href="https://github.com/gakutasu/spilab" target="_blank" rel="noreferrer">
            <ProviderIcon provider="github" />
            ソースコード・不具合報告
          </a>
        </div>
      </section>
    </div>
  );
}
