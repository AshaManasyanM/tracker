import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { describeSupabaseFetchError } from "../lib/supabaseErrors";
import { ensurePublicUserRow } from "../lib/syncPublicUser";
import { getSupabase, isSupabaseConfigured } from "../lib/supabaseClient";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setSession(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    sb.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error?.message) {
          console.warn("[auth] getSession:", error.message);
        }
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : "Failed to fetch";
        console.warn("[auth] getSession:", msg);
        setSession(null);
        setLoading(false);
      });
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !session?.user) return;
    void ensurePublicUserRow(sb, session.user);
  }, [session?.user?.id, session?.user?.email]);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb)
      return {
        error:
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a root .env file, then restart npm run dev.",
      };
    try {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
      return { error: error ? describeSupabaseFetchError(error.message) : null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch";
      return { error: describeSupabaseFetchError(msg) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb)
      return {
        error:
          "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to a root .env file, then restart npm run dev.",
      };
    try {
      const { error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/local` },
      });
      return { error: error ? describeSupabaseFetchError(error.message) : null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch";
      return { error: describeSupabaseFetchError(msg) };
    }
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [session, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { isSupabaseConfigured };
