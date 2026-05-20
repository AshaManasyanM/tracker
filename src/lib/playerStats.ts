import type { Match, Team } from "../types/tournament";
import { isPlayerGender, type PlayerGender } from "./playerGender";

export type PlayerStanding = {
  rank: number;
  playerId: string;
  playerName: string;
  gender: PlayerGender;
  teamId: string;
  teamName: string;
  totalKills: number;
  matchesPlayed: number;
};

export type DualMvp = {
  boy: PlayerStanding | null;
  girl: PlayerStanding | null;
};

function comparePlayers(a: PlayerStanding, b: PlayerStanding): number {
  if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
  if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
  return a.playerName.localeCompare(b.playerName);
}

function assignRanks(rows: PlayerStanding[]): void {
  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i]!;
    let strictlyBetter = 0;
    for (let j = 0; j < rows.length; j++) {
      if (comparePlayers(rows[j]!, cur) < 0) strictlyBetter++;
    }
    cur.rank = strictlyBetter + 1;
  }
}

/**
 * Fraggerboard: per-player elim totals across matches where their team has a result (placement set).
 * Only roster members with boy/girl set are included.
 */
export function computePlayerStandings(teams: Team[], matches: Match[]): PlayerStanding[] {
  const rows: PlayerStanding[] = [];

  for (const team of teams) {
    for (const p of team.players ?? []) {
      if (!isPlayerGender(p.gender)) continue;
      rows.push({
        rank: 0,
        playerId: p.id,
        playerName: p.name,
        gender: p.gender,
        teamId: team.id,
        teamName: team.name,
        totalKills: 0,
        matchesPlayed: 0,
      });
    }
  }

  const byPlayer = new Map(rows.map((x) => [x.playerId, x] as const));

  for (const m of matches) {
    for (const team of teams) {
      const r = m.results[team.id];
      if (!r || r.placement === null) continue;
      for (const p of team.players ?? []) {
        if (!isPlayerGender(p.gender)) continue;
        const row = byPlayer.get(p.id);
        if (!row) continue;
        const pk = r.playerKills?.[p.id] ?? 0;
        row.totalKills += Math.max(0, Math.floor(pk));
        row.matchesPlayed += 1;
      }
    }
  }

  rows.sort(comparePlayers);
  assignRanks(rows);
  return rows;
}

function topMvpForGender(rows: PlayerStanding[], gender: PlayerGender): PlayerStanding | null {
  const top = rows.find((r) => r.gender === gender && r.totalKills > 0);
  return top ?? null;
}

export function getMvps(teams: Team[], matches: Match[]): DualMvp {
  const rows = computePlayerStandings(teams, matches);
  return {
    boy: topMvpForGender(rows, "boy"),
    girl: topMvpForGender(rows, "girl"),
  };
}

/** @deprecated Use getMvps — kept for any single-MVP callers */
export function getMvp(teams: Team[], matches: Match[]): PlayerStanding | null {
  const { boy, girl } = getMvps(teams, matches);
  if (!boy) return girl;
  if (!girl) return boy;
  return boy.totalKills >= girl.totalKills ? boy : girl;
}
