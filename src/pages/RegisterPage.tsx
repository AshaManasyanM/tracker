import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SupabaseSetupNotice } from "../components/SupabaseSetupNotice";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../state/AuthContext";

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
        return;
      }
      setInfo(
        "Check your email to confirm your account if required by your project settings. You can try signing in afterward.",
      );
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-canvas-overlay p-6 shadow-panel sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold text-slate-100">Create account</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Each account has its own tournaments and saved results.
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
              Password (min 6 characters)
              <input
                type="password"
                autoComplete="new-password"
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
            {info && <p className="text-sm text-accent">{info}</p>}
            <button
              type="submit"
              disabled={busy || !isSupabaseConfigured}
              className="rounded-lg border border-accent/40 bg-accent/15 py-2.5 text-sm font-semibold text-accent-glow hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Creating…" : "Register"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
