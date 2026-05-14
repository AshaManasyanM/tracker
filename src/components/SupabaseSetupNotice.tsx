import { isSupabaseConfigured } from "../lib/supabaseClient";

export function SupabaseSetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-left text-sm text-amber-100/95"
    >
      <p className="font-semibold text-amber-50">Supabase is not configured for this build</p>
      <p className="mt-1 text-amber-100/85">
        Sign-in needs your project URL and anon key in a root <code className="rounded bg-black/25 px-1">.env</code> file
        (Vite only reads env at startup). The URL must be reachable from the browser (see error “Failed to fetch” if not).
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-amber-100/85">
        <li>
          Open{" "}
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-amber-200 underline decoration-amber-400/50 underline-offset-2 hover:text-amber-50"
          >
            Supabase Dashboard
          </a>{" "}
          → your project → <strong className="text-amber-50">Settings → API</strong>.
        </li>
        <li>
          Copy <strong className="text-amber-50">Project URL</strong> into{" "}
          <code className="rounded bg-black/25 px-1">VITE_SUPABASE_URL</code> and the{" "}
          <strong className="text-amber-50">anon public</strong> key into{" "}
          <code className="rounded bg-black/25 px-1">VITE_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Copy <code className="rounded bg-black/25 px-1">env.example</code> to{" "}
          <code className="rounded bg-black/25 px-1">.env</code>, paste the values, then{" "}
          <strong className="text-amber-50">restart</strong> <code className="rounded bg-black/25 px-1">npm run dev</code>.
        </li>
      </ol>
    </div>
  );
}
