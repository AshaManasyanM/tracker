import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SupabaseSetupNotice } from "../components/SupabaseSetupNotice";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../state/AuthContext";

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured || loading) return;
    if (user) navigate("/", { replace: true });
  }, [user, loading, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
        return;
      }
      navigate("/", { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-canvas-overlay p-6 shadow-panel sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold text-slate-100">Sign in</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          After sign-in you&apos;ll see your saved tournaments first; open one or use the scratch pad
          from there.
        </p>
        <div className="mt-6 space-y-4">
          <SupabaseSetupNotice />
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <label className="block text-sm text-slate-400">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isSupabaseConfigured}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
            <label className="block text-sm text-slate-400">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isSupabaseConfigured}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
            {error && (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !isSupabaseConfigured}
              className="rounded-lg border border-accent/40 bg-accent/15 py-2.5 text-sm font-semibold text-accent-glow hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
