import { useRef, useState } from 'react';
import { QUESTIONS_PER_DAY_OPTIONS } from '../types';
import { useSettings } from '../hooks/useSettings';
import { clearAnswers, getAllAnswers, importAnswers, saveSettings } from '../storage/db';
import { clearSession } from '../storage/sessionStore';
import { buildExport, exportFileName, parseImport } from '../storage/exportImport';

type Notice = { kind: 'ok' | 'ng'; text: string } | null;

export function SettingsPage() {
  const { settings, update } = useSettings();
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
      await saveSettings(data.settings);
      await update(data.settings);
      setNotice({ kind: 'ok', text: `${added}件の回答を追加しました（重複${data.answers.length - added}件はスキップ）。` });
    } catch (e) {
      setNotice({ kind: 'ng', text: e instanceof Error ? e.message : '読み込みに失敗しました。' });
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const resetAll = async () => {
    if (!window.confirm('学習履歴をすべて削除します。この操作は取り消せません。よろしいですか？')) return;
    await clearAnswers();
    clearSession();
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

      <section className="card">
        <h2>学習データ</h2>
        <p className="muted small">学習履歴はこのブラウザにのみ保存されます。別の端末やブラウザで続けるには、書き出したJSONを読み込んでください。</p>
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
          <button type="button" className="btn btn-danger" onClick={() => void resetAll()}>
            学習履歴をすべて削除
          </button>
        </div>
      </section>
    </div>
  );
}
