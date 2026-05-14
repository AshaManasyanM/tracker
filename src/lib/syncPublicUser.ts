import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures a row exists in public.users for the signed-in Auth user.
 * Complements the DB trigger (handles older accounts or manual Auth users).
 */
export async function ensurePublicUserRow(sb: SupabaseClient, user: User): Promise<void> {
  const { error } = await sb.from("users").upsert(
    { id: user.id, email: user.email ?? null },
    { onConflict: "id" },
  );
  if (error) {
    console.warn("[users] could not sync public.users:", error.message);
  }
}
