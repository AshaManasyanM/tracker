/**
 * Registers a Supabase Auth user (same as the in-app Register form).
 *
 * Usage (from project root; npm loads .env via --env-file):
 *   npm run auth:create-user -- <email> <password>
 */
import { createClient } from "@supabase/supabase-js";
import { stripEnvQuotes, supabaseUrlToOrigin } from "./supabaseUrlOrigin.mjs";

const url = supabaseUrlToOrigin(process.env.VITE_SUPABASE_URL);
const anonKey = stripEnvQuotes(process.env.VITE_SUPABASE_ANON_KEY);
const email = process.argv[2];
const password = process.argv[3];

if (!url || !anonKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.\n" +
      "Put them in .env at the project root, then run: npm run auth:create-user -- <email> <password>\n" +
      "(npm uses node --env-file=.env so variables are loaded from .env.)",
  );
  process.exit(1);
}
if (!email || !password) {
  console.error("Usage: npm run auth:create-user -- <email> <password>");
  process.exit(1);
}

const sb = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await sb.auth.signUp({
  email: email.trim(),
  password,
});

if (error) {
  console.error("signUp failed:", error.message);
  process.exit(1);
}

if (data.session) {
  console.log("User created and signed in (email confirmation appears disabled for this project).");
} else {
  console.log("User created. If email confirmation is on, check the inbox or Auth → Users in Supabase.");
}
console.log("User id:", data.user?.id ?? "(none)");
