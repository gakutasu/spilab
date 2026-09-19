import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Question, AnswerResult } from '../types';
import { useSettings } from '../hooks/useSettings';
import { getSecret } from '../storage/db';
import { buildTutorSystemPrompt, describeChatError, streamChat, PRESET_QUESTIONS, PROVIDER_LABEL, type ChatMessage } from '../ai/chat';
import { Markdown } from './Markdown';

interface Props {
  question: Question;
  selectedChoice: number | null;
  result: AnswerResult;
  answerTimeMs: number;
}

export function AskAiPanel({ question, selectedChoice, result, answerTimeMs }: Props) {
  const { settings } = useSettings();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const provider = settings.aiProvider;
  const model = settings.aiModels[provider];

  useEffect(() => {
    void getSecret(provider === 'anthropic' ? 'anthropicApiKey' : 'openaiApiKey').then(setApiKey);
  }, [provider]);

  // New question → new conversation.
  useEffect(() => {
    setMessages([]);
    setStreaming('');
    setError(null);
    abort.current?.abort();
  }, [question.id]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, streaming]);

  const ask = async (text: string) => {
    if (!apiKey || busy || !text.trim()) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text.trim() }];
    setMessages(next);
    setDraft('');
    setError(null);
    setBusy(true);
    setStreaming('');
    const controller = new AbortController();
    abort.current = controller;
    try {
      const reply = await streamChat({
        provider,
        apiKey,
        model,
        system: buildTutorSystemPrompt({ question, selectedChoice, result, answerTimeMs }),
        messages: next,
        onDelta: (t) => setStreaming((s) => s + t),
        signal: controller.signal,
      });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      if (!controller.signal.aborted) setError(describeChatError(e));
      else setMessages(next.slice(0, -1));
    } finally {
      setStreaming('');
      setBusy(false);
    }
  };

  if (apiKey === null) return null;
  if (apiKey === '') {
    return (
      <section className="card ask-ai">
        <h2>AIに質問する</h2>
        <p className="muted small">
          解説で足りない点を Claude / OpenAI に質問できます。<Link to="/settings">設定画面</Link>で API キーを登録すると使えます。
        </p>
      </section>
    );
  }

  const presets = PRESET_QUESTIONS.filter((p) => !p.when || p.when.includes(result));

  return (
    <section className="card ask-ai">
      <div className="card-head">
        <h2>AIに質問する</h2>
        <span className="muted small">
          {PROVIDER_LABEL[provider]} / {model}
        </span>
      </div>

      {messages.length === 0 && !busy && (
        <div className="preset-list">
          {presets.map((p) => (
            <button key={p.label} type="button" className="btn btn-secondary btn-preset" onClick={() => void ask(p.text)}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg chat-${m.role}`}>
            {m.role === 'assistant' ? <Markdown text={m.content} /> : <p>{m.content}</p>}
          </div>
        ))}
        {busy && (
          <div className="chat-msg chat-assistant">
            {streaming ? <Markdown text={streaming} /> : <p className="muted">考え中…</p>}
          </div>
        )}
        <div ref={bottom} />
      </div>

      {error && <p className="notice ng">{error}</p>}

      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(draft);
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="解説でわからなかった点を質問…"
          rows={2}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void ask(draft);
            }
          }}
        />
        <div className="chat-actions">
          {busy ? (
            <button type="button" className="btn btn-secondary" onClick={() => abort.current?.abort()}>
              中断
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
              送信
            </button>
          )}
        </div>
      </form>
      <p className="muted small">API 利用料金はキーの持ち主に課金されます。会話はこの問題の間だけ保持され、保存されません。</p>
    </section>
  );
}
