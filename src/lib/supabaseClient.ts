import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

/** True when env looks like a real project (not empty and not template placeholders from env.example). */
export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawKey &&
    !/YOUR_PROJECT/i.test(rawUrl) &&
    !/^your_anon_key$/i.test(rawKey),
);

function normalizeSupabaseProjectUrl(input: string): string {
  const s = input.trim();
  try {
    const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(withProto);
    if (u.hostname.endsWith(".supabase.co") && u.protocol === "http:") {
      u.protocol = "https:";
    }
    return u.origin;
  } catch {
    return s;
  }
}

const url = isSupabaseConfigured ? normalizeSupabaseProjectUrl(rawUrl!) : undefined;
const anonKey = isSupabaseConfigured ? rawKey : undefined;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!_client) {
    _client = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}
