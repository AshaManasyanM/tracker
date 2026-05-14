import type { MatchTeamResult, Team } from "../types/tournament";

/** Max roster size per squad (lineup + bench). */
export const MAX_PLAYERS_PER_TEAM = 6;

/**
 * Team kills used for scoring: sum of roster elims when a roster exists, otherwise the legacy
 * single `kills` field on the match row.
 */
export function effectiveTeamKills(team: Team, r: MatchTeamResult): number {
  const players = team.players ?? [];
  if (players.length === 0) return Math.max(0, Math.floor(r.kills));
  const pk = r.playerKills ?? {};
  let sum = 0;
  for (const p of players) {
    sum += Math.max(0, Math.floor(pk[p.id] ?? 0));
  }
  return sum;
}

/**
 * Aligns `playerKills` keys with the current roster and keeps `kills` equal to the sum of roster
 * elims. If a roster was just added and only legacy team `kills` existed, credits that total to
 * the first listed player once so historical points stay stable.
 */
export function normalizeMatchTeamResult(team: Team, r: MatchTeamResult): MatchTeamResult {
  const players = team.players ?? [];
  if (players.length === 0) {
    const next: MatchTeamResult = { ...r, kills: Math.max(0, Math.floor(r.kills)) };
    delete next.playerKills;
    return next;
  }

  const rawPk = r.playerKills ?? {};
  const hadAnyStoredKey = Object.keys(rawPk).length > 0;
  const pk: Record<string, number> = { ...rawPk };
  for (const p of players) {
    if (pk[p.id] === undefined) pk[p.id] = 0;
  }
  for (const id of Object.keys(pk)) {
    if (!players.some((p) => p.id === id)) delete pk[id];
  }

  const legacyTeamKills = Math.max(0, Math.floor(r.kills));
  if (!hadAnyStoredKey && legacyTeamKills > 0) {
    pk[players[0]!.id] = legacyTeamKills;
  }

  const kills = players.reduce(
    (acc, p) => acc + Math.max(0, Math.floor(pk[p.id] ?? 0)),
    0,
  );
  return { ...r, playerKills: pk, kills };
}
