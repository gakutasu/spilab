import { useEffect } from 'react';
import { useSync } from '../hooks/useSync';
import { AUTH_PROVIDERS } from '../storage/supabase';
import { ProviderIcon } from './ProviderIcon';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function IntroModal({ open, onClose }: Props) {
  const sync = useSync();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="intro-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="intro-title">SPILAB へようこそ</h2>
        <p className="muted">転職向け SPI 対策。1 問ずつ解いて、苦手分野を優先的に練習します。</p>
        <ol className="intro-steps">
          <li>
            <strong>問題をはじめる</strong>を押すと問題が表示され、同時にタイマーが動きます。
          </li>
          <li>
            A〜D を選ぶか、解き方がわからなければ<strong>「わからない」</strong>を押します。当てずっぽうより正確な記録になります。
          </li>
          <li>
            1 問ごとに採点と詳しい解説。正誤・解答時間・「わからない」から得意/苦手を判定し、<strong>次回の出題に反映</strong>します。
          </li>
        </ol>
        <p className="small muted">学習履歴はこのブラウザに保存されます。サーバーには送信されません。</p>

        {sync.configured && !sync.user && (
          <div className="intro-signin">
            <p>
              <strong>ログインすると</strong>、スマホと PC など複数の端末で同じ履歴を使えます（任意・あとからでも可）。
            </p>
            <div className="actions">
              {AUTH_PROVIDERS.map((p) => (
                <button key={p} type="button" className="btn btn-secondary btn-provider" onClick={() => void sync.signIn(p)}>
                  <ProviderIcon provider={p} />
                  {p === 'google' ? 'Googleでログイン' : 'GitHubでログイン'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
            {sync.configured && !sync.user ? 'ログインせずにはじめる' : 'はじめる'}
          </button>
        </div>
        <p className="small muted center">この案内は設定画面からいつでも見直せます。</p>
      </div>
    </div>
  );
}
