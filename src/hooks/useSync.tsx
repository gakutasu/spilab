import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AnswerRecord, Question, Settings } from '../types';
import { SYNC_CONFIGURED, supabase } from '../storage/supabase';
import {
  deleteAnswersRemote,
  deleteGeneratedRemote,
  loadLastSyncAt,
  pushAnswers,
  pushGenerated,
  pushSettings,
  saveLastSyncAt,
  syncAll,
} from '../storage/sync';
import { useQuestionBank } from '../questions/bank';

export type OAuthProvider = 'google' | 'github';

export interface SyncUser {
  id: string;
  email: string | null;
}

export interface SyncContextValue {
  configured: boolean;
  user: SyncUser | null;
  syncing: boolean;
  lastSyncAt: string | null;
  error: string | null;
  /** Incremented after remote data was merged locally; hooks reload on change. */
  version: number;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  afterAnswer: (record: AnswerRecord) => void;
  afterGeneratedSaved: (questions: Question[]) => void;
  afterGeneratedDeleted: (ids: string[] | 'all') => void;
  afterSettingsChanged: (settings: Settings) => void;
  afterAnswersCleared: () => Promise<void>;
}

const noop = () => undefined;
const disabled: SyncContextValue = {
  configured: false,
  user: null,
  syncing: false,
  lastSyncAt: null,
  error: null,
  version: 0,
  signIn: async () => undefined,
  signOut: async () => undefined,
  syncNow: async () => undefined,
  afterAnswer: noop,
  afterGeneratedSaved: noop,
  afterGeneratedDeleted: noop,
  afterSettingsChanged: noop,
  afterAnswersCleared: async () => undefined,
};

const SyncContext = createContext<SyncContextValue>(disabled);

function describe(e: unknown): string {
  return e instanceof Error ? e.message : '同期に失敗しました。';
}

function toUser(session: Session | null): SyncUser | null {
  return session ? { id: session.user.id, email: session.user.email ?? null } : null;
}

/** Removes the OAuth `code` query parameter left after the PKCE redirect. */
function cleanOAuthUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('code')) return;
  url.searchParams.delete('code');
  window.history.replaceState({}, '', url.toString());
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const client = supabase();
  const bank = useQuestionBank();
  const [user, setUser] = useState<SyncUser | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(() => loadLastSyncAt());
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const userRef = useRef<SyncUser | null>(null);
  userRef.current = user;

  const runSync = useCallback(
    async (u: SyncUser) => {
      if (!client) return;
      setSyncing(true);
      setError(null);
      try {
        const result = await syncAll(client, u.id);
        setLastSyncAt(loadLastSyncAt());
        if (result.pulledAnswers || result.pulledGenerated || result.settingsApplied) {
          await bank.reload();
          setVersion((v) => v + 1);
        }
      } catch (e) {
        setError(describe(e));
      } finally {
        setSyncing(false);
      }
    },
    [client, bank],
  );

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      const u = toUser(data.session);
      setUser(u);
      cleanOAuthUrl();
      if (u) void runSync(u);
    });
    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      const u = toUser(session);
      setUser(u);
      if (event === 'SIGNED_IN' && u) {
        cleanOAuthUrl();
        void runSync(u);
      }
      if (event === 'SIGNED_OUT') {
        saveLastSyncAt(null);
        setLastSyncAt(null);
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // runSync identity changes with bank; the initial sync must run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const guarded = useCallback(
    (work: (u: SyncUser) => Promise<void>) => {
      const u = userRef.current;
      if (!client || !u) return;
      work(u).catch((e) => setError(describe(e)));
    },
    [client],
  );

  const value = useMemo<SyncContextValue>(() => {
    if (!client) return disabled;
    return {
      configured: SYNC_CONFIGURED,
      user,
      syncing,
      lastSyncAt,
      error,
      version,
      signIn: async (provider) => {
        setError(null);
        const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
        const { error: e } = await client.auth.signInWithOAuth({ provider, options: { redirectTo } });
        if (e) setError(e.message);
      },
      signOut: async () => {
        await client.auth.signOut();
      },
      syncNow: async () => {
        const u = userRef.current;
        if (u) await runSync(u);
      },
      afterAnswer: (record) => guarded((u) => pushAnswers(client, u.id, [record])),
      afterGeneratedSaved: (questions) => guarded((u) => pushGenerated(client, u.id, questions)),
      afterGeneratedDeleted: (ids) => guarded((u) => deleteGeneratedRemote(client, u.id, ids)),
      afterSettingsChanged: (settings) => guarded((u) => pushSettings(client, u.id, settings)),
      afterAnswersCleared: async () => {
        const u = userRef.current;
        if (!u) return;
        try {
          await deleteAnswersRemote(client, u.id);
        } catch (e) {
          setError(describe(e));
        }
      },
    };
  }, [client, user, syncing, lastSyncAt, error, version, runSync, guarded]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  return useContext(SyncContext);
}
