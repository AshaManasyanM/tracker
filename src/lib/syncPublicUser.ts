import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures a row exists in public.users for the signed-in Auth user.
 * Complements the DB trigger (handles older accounts or manual Auth users).
 * Sends created_at from Auth when present so SQL matches signup time (see migration 003).
 */
export async function ensurePublicUserRow(sb: SupabaseClient, user: User): Promise<void> {
  const row: { id: string; email: string | null; created_at?: string } = {
    id: user.id,
    email: user.email ?? null,
  };
  if (user.created_at) {
    row.created_at = user.created_at;
  }
  const { error } = await sb.from("users").upsert(row, { onConflict: "id" });
  if (error) {
    console.warn("[users] could not sync public.users:", error.message);
  }
}
