import { Navigate, Outlet } from "react-router-dom";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../state/AuthContext";

export function RequireAuth() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-canvas px-4 py-16 text-center">
        <p className="max-w-md text-sm leading-relaxed text-slate-400">
          Cloud sign-in is not configured. Add{" "}
          <code className="rounded bg-canvas-overlay px-1 py-0.5 text-slate-300">VITE_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-canvas-overlay px-1 py-0.5 text-slate-300">VITE_SUPABASE_ANON_KEY</code> to{" "}
          <code className="rounded bg-canvas-overlay px-1 py-0.5 text-slate-300">.env</code>, restart the dev server, then
          sign in. The workspace (<code className="text-slate-300">/local</code>), dashboard, and cloud saves require
          authentication.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
