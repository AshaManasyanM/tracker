import type { Tournament } from "../types/tournament";
import { getSupabase } from "./supabaseClient";
import { createEmptyTournament, ensureAllMatchesShape } from "./tournamentDefaults";

function normalizeLoaded(rowId: string, raw: unknown): Tournament | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Tournament;
  if (!Array.isArray(t.teams) || !Array.isArray(t.matches)) return null;
  const matches = ensureAllMatchesShape(t.matches, t.teams);
  const activeMatchId =
    t.activeMatchId && matches.some((m) => m.id === t.activeMatchId)
      ? t.activeMatchId
      : matches[0]?.id ?? null;
  return {
    ...t,
    id: rowId,
    matches,
    activeMatchId,
  };
}

export type TournamentListItem = {
  id: string;
  name: string;
  updated_at: string;
};

export async function listMyTournaments(): Promise<TournamentListItem[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("tournaments")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TournamentListItem[];
}

export async function fetchTournamentById(id: string): Promise<Tournament | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("tournaments").select("id, data").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return normalizeLoaded(data.id as string, data.data);
}

export async function saveTournamentRow(t: Tournament): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  const { error } = await sb
    .from("tournaments")
    .update({
      name: t.name,
      data: { ...t, id: t.id },
      updated_at: new Date().toISOString(),
    })
    .eq("id", t.id);
  if (error) throw error;
}

export async function createTournamentForUser(): Promise<string> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const shell = createEmptyTournament("New scrim");
  const id = crypto.randomUUID();
  const matches = ensureAllMatchesShape(shell.matches, shell.teams);
  const activeMatchId =
    shell.activeMatchId && matches.some((m) => m.id === shell.activeMatchId)
      ? shell.activeMatchId
      : matches[0]?.id ?? null;
  const full: Tournament = {
    ...shell,
    id,
    matches,
    activeMatchId,
  };

  const { error } = await sb.from("tournaments").insert({
    id,
    user_id: user.id,
    name: full.name,
    data: full,
  });
  if (error) throw error;
  return id;
}

export async function deleteTournamentRow(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  const { error } = await sb.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}

/** Creates a new cloud tournament row, then overwrites it with the current local workspace (for cross-device use). */
export async function saveLocalScratchAsCloudTournament(local: Tournament): Promise<string> {
  const id = await createTournamentForUser();
  const matches = ensureAllMatchesShape(local.matches, local.teams);
  const activeMatchId =
    local.activeMatchId && matches.some((m) => m.id === local.activeMatchId)
      ? local.activeMatchId
      : matches[0]?.id ?? null;
  const merged: Tournament = {
    ...local,
    id,
    matches,
    activeMatchId,
    updatedAt: Date.now(),
  };
  await saveTournamentRow(merged);
  return id;
}
