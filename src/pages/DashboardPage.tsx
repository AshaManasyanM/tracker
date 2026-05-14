import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { describeSupabaseFetchError } from "../lib/supabaseErrors";
import { createTournamentForUser, listMyTournaments, type TournamentListItem } from "../lib/tournamentDb";
import { formatSavedAt } from "../lib/formatSavedAt";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../state/AuthContext";

export function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<TournamentListItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoadError(null);
    try {
      const rows = await listMyTournaments();
      setItems(rows);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load tournaments.";
      setLoadError(describeSupabaseFetchError(msg));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) void refresh();
  }, [authLoading, user, refresh]);

  useEffect(() => {
    if (!user) return;
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [user, refresh]);

  const onCreate = async () => {
    setBusy(true);
    try {
      const id = await createTournamentForUser();
      navigate(`/t/${id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not create tournament.";
      setLoadError(describeSupabaseFetchError(msg));
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-xl font-semibold text-slate-100">Cloud mode not configured</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Add <code className="text-accent">VITE_SUPABASE_URL</code> and{" "}
          <code className="text-accent">VITE_SUPABASE_ANON_KEY</code> to a{" "}
          <code className="text-slate-500">.env</code> file, run the SQL in{" "}
          <code className="text-slate-500">supabase/migrations/001_tournaments.sql</code> and{" "}
          <code className="text-slate-500">002_users.sql</code>, and{" "}
          <code className="text-slate-500">003_users_created_at_from_auth.sql</code> in your Supabase project, then restart{" "}
          <code className="text-slate-500">npm run dev</code>.
        </p>
        <p className="mt-6 text-xs text-slate-600">
          Sign in is available after environment variables are set.
        </p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Your tournaments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Signed in as <span className="text-slate-300">{user?.email}</span> — below is everything
            already saved to your account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void refresh()}
            className="rounded-lg border border-line bg-canvas-overlay px-4 py-2 text-sm text-slate-300 hover:border-white/20"
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onCreate()}
            className="rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent-glow hover:bg-accent/25 disabled:opacity-50"
          >
            {busy ? "Creating…" : "New tournament"}
          </button>
          <button
            type="button"
            onClick={() => void signOut().then(() => navigate("/login"))}
            className="rounded-lg border border-line bg-canvas-overlay px-4 py-2 text-sm text-slate-300 hover:border-white/20"
          >
            Sign out
          </button>
        </div>
      </header>

      {loadError && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {loadError}
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {items.length === 0 && !loadError && (
          <li className="rounded-xl border border-dashed border-line bg-canvas-overlay/50 px-4 py-8 text-center text-sm text-slate-500">
            No tournaments yet. Create one to open the results console — your data will appear here
            after each save.
          </li>
        )}
        {items.map((row) => {
          const saved = formatSavedAt(row.updated_at);
          return (
            <li key={row.id}>
              <Link
                to={`/t/${row.id}`}
                className="flex flex-col gap-0.5 rounded-xl border border-line bg-canvas-overlay px-4 py-3 text-left shadow-panel transition hover:border-accent/30 hover:bg-canvas-raised/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-slate-100">{row.name || "Untitled"}</span>
                <span
                  className="text-xs tabular-nums text-slate-500"
                  title={`Last saved: ${saved.title}`}
                >
                  Last saved · {saved.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {user && (
        <p className="mt-10 text-center text-[11px] text-slate-600">
          <Link to="/local" className="text-slate-600 underline decoration-slate-700 underline-offset-2 hover:text-slate-400">
            Device-only scratch pad
          </Link>
          <span className="text-slate-700"> · </span>
          <span className="text-slate-700">Not synced — this browser only</span>
        </p>
      )}
    </div>
  );
}
