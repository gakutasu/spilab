import { useEffect, useState } from 'react';
import type { AiProvider } from '../types';
import { useSettings } from '../hooks/useSettings';
import { getSecret, saveSecret } from '../storage/db';
import { DEFAULT_MODELS, KEY_PAGE, PROVIDER_LABEL, describeChatError, listModels, type ModelChoice } from '../ai/chat';

const PROVIDERS: AiProvider[] = ['anthropic', 'openai'];
const SECRET_KEY = { anthropic: 'anthropicApiKey', openai: 'openaiApiKey' } as const;

export function AiSettings() {
  const { settings, update } = useSettings();
  const provider = settings.aiProvider;
  const [keys, setKeys] = useState<Record<AiProvider, string>>({ anthropic: '', openai: '' });
  const [loaded, setLoaded] = useState(false);
  const [models, setModels] = useState<Record<AiProvider, ModelChoice[]>>(DEFAULT_MODELS);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'ng'; text: string } | null>(null);

  useEffect(() => {
    void Promise.all([getSecret('anthropicApiKey'), getSecret('openaiApiKey')]).then(([a, o]) => {
      setKeys({ anthropic: a, openai: o });
      setLoaded(true);
    });
  }, []);

  const saveKey = async () => {
    await saveSecret(SECRET_KEY[provider], keys[provider].trim());
    setNotice({ kind: 'ok', text: keys[provider].trim() ? `${PROVIDER_LABEL[provider]} の API キーをこのブラウザに保存しました。` : 'API キーを削除しました。' });
  };

  const fetchModels = async () => {
    const key = keys[provider].trim();
    if (!key) {
      setNotice({ kind: 'ng', text: '先に API キーを入力してください。' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const list = await listModels(provider, key);
      if (list.length === 0) throw new Error('モデルが取得できませんでした。');
      setModels((m) => ({ ...m, [provider]: list }));
      setNotice({ kind: 'ok', text: `${list.length} 件のモデルを取得しました（キーの認証も成功）。` });
    } catch (e) {
      setNotice({ kind: 'ng', text: describeChatError(e) });
    } finally {
      setBusy(false);
    }
  };

  const current = settings.aiModels[provider];
  const options = models[provider].some((m) => m.id === current) ? models[provider] : [{ id: current, label: current }, ...models[provider]];

  return (
    <section className="card">
      <h2>AIに質問（Claude / OpenAI）</h2>
      <p className="muted small">
        採点後に、解説で足りない点を AI に質問できます。自分の API キーをブラウザに保存して直接呼び出します（このブラウザにのみ保存。同期・書き出しの対象外。利用料金はキーの持ち主に課金）。
      </p>
      <label className="field">
        <span>使うサービス</span>
        <select value={provider} onChange={(e) => void update({ ...settings, aiProvider: e.target.value as AiProvider })}>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {PROVIDER_LABEL[p]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>
          {PROVIDER_LABEL[provider]} の API キー（
          <a href={KEY_PAGE[provider]} target="_blank" rel="noreferrer">
            発行ページ
          </a>
          ）
        </span>
        <input
          type="password"
          autoComplete="off"
          placeholder={provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
          value={keys[provider]}
          disabled={!loaded}
          onChange={(e) => setKeys({ ...keys, [provider]: e.target.value })}
        />
      </label>
      <div className="actions actions-row">
        <button type="button" className="btn btn-secondary" onClick={() => void saveKey()} disabled={!loaded}>
          キーを保存
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => void fetchModels()} disabled={busy || !loaded}>
          {busy ? '取得中…' : 'モデル一覧を取得'}
        </button>
      </div>
      <label className="field">
        <span>モデル</span>
        <select value={current} onChange={(e) => void update({ ...settings, aiModels: { ...settings.aiModels, [provider]: e.target.value } })}>
          {options.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      {notice && <p className={`notice ${notice.kind}`}>{notice.text}</p>}
    </section>
  );
}
