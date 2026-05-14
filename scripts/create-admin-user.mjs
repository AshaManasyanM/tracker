/**
 * Creates a confirmed Auth user via the Admin API (bypasses “confirm email”).
 * Uses the service_role key — NEVER import this key into the Vite app or commit it.
 *
 * 1. Dashboard → Settings → API → copy "service_role" (secret) into .env as:
 *    SUPABASE_SERVICE_ROLE_KEY=eyJ...
 * 2. From project root (npm loads .env automatically):
 *    npm run auth:create-admin -- admin@example.com 'YourStrongPassword'
 */
import { createClient } from "@supabase/supabase-js";
import { jwtRoleFromKey, stripEnvQuotes, supabaseUrlToOrigin } from "./supabaseUrlOrigin.mjs";

const url = supabaseUrlToOrigin(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
const serviceKey = stripEnvQuotes(process.env.SUPABASE_SERVICE_ROLE_KEY);
const email = process.argv[2];
const password = process.argv[3];

if (!url || !serviceKey) {
  const missing = [!url && "VITE_SUPABASE_URL or SUPABASE_URL", !serviceKey && "SUPABASE_SERVICE_ROLE_KEY"]
    .filter(Boolean)
    .join(", ");
  console.error(`Missing: ${missing}.\n`);
  console.error(
    "These scripts load environment from a file named .env in the current directory (see package.json: node --env-file=.env).\n" +
      "  • Put VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env at the project root.\n" +
      "  • Run: cd /path/to/this/project && npm run auth:create-admin -- you@email.com 'YourPassword'\n" +
      "  • If you ran plain `node scripts/...` without --env-file=.env, variables from .env are NOT loaded.\n" +
      "  • Exact key name: SUPABASE_SERVICE_ROLE_KEY (not VITE_…). Never put the service role key in frontend code.",
  );
  process.exit(1);
}
if (!email || !password) {
  console.error(
    "Usage: npm run auth:create-admin -- <email> <password>\n" +
      "Example: npm run auth:create-admin -- admin@example.com 'YourStrongPassword'",
  );
  process.exit(1);
}

const jwtRole = jwtRoleFromKey(serviceKey);
if (jwtRole && jwtRole !== "service_role") {
  console.error(
    `SUPABASE_SERVICE_ROLE_KEY is a JWT with role "${jwtRole}", but the Admin API requires role "service_role".\n` +
      "You likely pasted the anon (public) key by mistake.\n" +
      "Fix: Supabase → Project Settings → API → under API Keys copy the secret labeled service_role (legacy JWT), not anon.",
  );
  process.exit(1);
}
if (serviceKey.startsWith("sb_publishable_")) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY looks like a publishable key (sb_publishable_…).\n" +
      "Use the secret service key: either the legacy JWT service_role value, or an sb_secret_… key meant for server-side use (Dashboard → Settings → API).",
  );
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await sb.auth.admin.createUser({
  email: email.trim(),
  password,
  email_confirm: true,
  user_metadata: { app_role: "admin" },
});

if (error) {
  console.error("admin.createUser failed:", error.message);
  if (/invalid path/i.test(error.message)) {
    console.error(
      "\nThis often means VITE_SUPABASE_URL must be the project root only, e.g.\n" +
        "  https://YOUR_REF.supabase.co\n" +
        "Do not include /rest/v1, /auth/v1, or other paths (re-copy from Settings → API → Project URL).",
    );
  }
  if (/not allowed/i.test(error.message)) {
    console.error(
      "\nAlmost always: SUPABASE_SERVICE_ROLE_KEY is not the real service_role secret (wrong key or truncated).\n" +
        "Re-copy from Settings → API → service_role. It must not be the anon key. If you use new-style keys, use the backend secret (sb_secret_…), not sb_publishable_….",
    );
  }
  if (/already|registered|exists/i.test(error.message)) {
    console.error(
      "\nThat email may already exist. In Dashboard → Authentication → Users you can reset the password, or delete the user and run this script again.",
    );
  }
  process.exit(1);
}

const u = data.user;
if (!u) {
  console.error("No user returned.");
  process.exit(1);
}

const { error: rowErr } = await sb.from("users").upsert(
  { id: u.id, email: u.email ?? email.trim() },
  { onConflict: "id" },
);
if (rowErr) {
  console.warn("Could not upsert public.users (table or RLS?):", rowErr.message);
}

console.log("Admin user created and email is confirmed. Sign in in the app with this email and password.");
console.log("User id:", u.id);
