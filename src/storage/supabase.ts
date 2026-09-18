import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SYNC_CONFIGURED = Boolean(url && anonKey);

export type OAuthProvider = 'google' | 'github';
const KNOWN: OAuthProvider[] = ['google', 'github'];

/** Providers enabled for this build (default: both). */
export const AUTH_PROVIDERS: OAuthProvider[] = (import.meta.env.VITE_AUTH_PROVIDERS ?? 'google,github')
  .split(',')
  .map((p) => p.trim().toLowerCase())
  .filter((p): p is OAuthProvider => (KNOWN as string[]).includes(p));

let client: SupabaseClient | null = null;

/** Returns the shared client, or null when the build has no Supabase configuration. */
export function supabase(): SupabaseClient | null {
  if (!SYNC_CONFIGURED) return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
