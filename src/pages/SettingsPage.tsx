import { useEffect, useRef, useState } from 'react';
import { QUESTIONS_PER_DAY_OPTIONS } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useQuestionBank } from '../questions/bank';
import { useSync } from '../hooks/useSync';
import { formatDateTime } from '../utils/format';
import { MODEL_OPTIONS } from '../ai/models';
import {
  addGeneratedQuestions,
  clearAnswers,
  clearGeneratedQuestions,
  getAllAnswers,
  getApiKey,
  importAnswers,
  saveApiKey,
} from '../storage/db';
import { clearSession } from '../storage/sessionStore';
import { buildExport, exportFileName, parseImport } from '../storage/exportImport';

type Notice = { kind: 'ok' | 'ng'; text: string } | null;

export function SettingsPage() {
  const { settings, update } = useSettings();
  const bank = useQuestionBank();
  const sync = useSync();
  const [notice, setNotice] = useState<Notice>(null);
  const [aiNotice, setAiNotice] = useState<Notice>(null);
  const [apiKey, setApiKey] = useState('');
  const [keyLoaded, setKeyLoaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void getApiKey().then((k) => {
      setApiKey(k);
      setKeyLoaded(true);
    });
  }, []);

  const saveKey = async () => {
    await saveApiKey(apiKey.trim());
    setAiNotice({ kind: 'ok', text: apiKey.trim() ? 'APIキーをこのブラウザに保存しました。' : 'APIキーを削除しました。' });
  };

  const exportData = async () => {
    const answers = await getAllAnswers();
    const data = buildExport(settings, answers, bank.generated);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName();
    a.click();
    URL.revokeObjectURL(url);
    setNotice({ kind: 'ok', text: `回答${answers.length}件、AI生成問題${bank.generated.length}件を書き出しました。` });
  };

  const importData = async (file: File) => {
    try {
      const data = parseImport(await file.text());
      const added = await importAnswers(data.answers);
      const addedQuestions = await addGeneratedQuestions(data.generatedQuestions);
      await update(data.settings);
      await bank.reload();
      if (sync.user) void sync.syncNow();
      setNotice({
        kind: 'ok',
        text: `回答${added}件（重複${data.answers.length - added}件はスキップ）、AI生成問題${addedQuestions}件を追加しました。`,
      });
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

  const resetGenerated = async () => {
    if (!window.confirm(`AI生成問題${bank.generated.length}件をすべて削除します。これらの問題の回答履歴は集計から外れます。よろしいですか？`)) return;
    await clearGeneratedQuestions();
    sync.afterGeneratedDeleted('all');
    clearSession();
    await bank.reload();
    setNotice({ kind: 'ok', text: 'AI生成問題を削除しました。' });
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
              <p className="muted small">回答・AI生成問題・設定は自動で同期されます。APIキーは同期しません。</p>
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
              <div className="actions actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => void sync.signIn('google')}>
                  Googleでログイン
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => void sync.signIn('github')}>
                  GitHubでログイン
                </button>
              </div>
            </>
          )}
          {sync.error && <p className="notice ng">{sync.error}</p>}
        </section>
      )}

      <section className="card">
        <h2>AI問題生成（Anthropic API）</h2>
        <p className="muted small">
          自分のAnthropic APIキーを使って、ブラウザから直接Claudeに問題を作らせます。キーはこのブラウザにのみ保存され、書き出しデータにも含まれません。
          生成にはAPIの利用料金がかかります。
        </p>
        <label className="field">
          <span>APIキー</span>
          <input
            type="password"
            autoComplete="off"
            placeholder="sk-ant-..."
            value={apiKey}
            disabled={!keyLoaded}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </label>
        <div className="actions">
          <button type="button" className="btn btn-secondary" onClick={() => void saveKey()} disabled={!keyLoaded}>
            APIキーを保存
          </button>
        </div>
        <label className="field">
          <span>モデル</span>
          <select value={settings.aiModel} onChange={(e) => void update({ ...settings, aiModel: e.target.value })}>
            {MODEL_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field field-inline">
          <input type="checkbox" checked={settings.aiVerify} onChange={(e) => void update({ ...settings, aiVerify: e.target.checked })} />
          <span>生成後に別の呼び出しで検算する（推奨。呼び出し回数は増えます）</span>
        </label>
        {aiNotice && <p className={`notice ${aiNotice.kind}`}>{aiNotice.text}</p>}
      </section>

      <section className="card">
        <h2>学習データ</h2>
        <p className="muted small">
          学習履歴とAI生成問題はこのブラウザにのみ保存されます。別の端末やブラウザで続けるには、書き出したJSONを読み込んでください。
        </p>
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
        <h2>リセット</h2>
        <div className="actions">
          <button type="button" className="btn btn-danger" onClick={() => void resetAnswers()}>
            学習履歴をすべて削除
          </button>
          <button type="button" className="btn btn-danger" onClick={() => void resetGenerated()} disabled={bank.generated.length === 0}>
            AI生成問題をすべて削除（{bank.generated.length}件）
          </button>
        </div>
      </section>
    </div>
  );
}
