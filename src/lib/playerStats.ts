import type { Match, Team } from "../types/tournament";

export type PlayerStanding = {
  rank: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  totalKills: number;
  matchesPlayed: number;
};

function comparePlayers(a: PlayerStanding, b: PlayerStanding): number {
  if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
  if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
  return a.playerName.localeCompare(b.playerName);
}

/**
 * Fraggerboard: per-player elim totals across matches where their team has a result (placement set).
 * Uses roster `playerKills` when present; otherwise no row (teams without rosters do not produce
 * player stats).
 */
export function computePlayerStandings(teams: Team[], matches: Match[]): PlayerStanding[] {
  const rows: PlayerStanding[] = [];

  for (const team of teams) {
    const players = team.players ?? [];
    if (players.length === 0) continue;
    for (const p of players) {
      rows.push({
        rank: 0,
        playerId: p.id,
        playerName: p.name,
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
      const players = team.players ?? [];
      if (players.length === 0) continue;
      for (const p of players) {
        const row = byPlayer.get(p.id);
        if (!row) continue;
        const pk = r.playerKills?.[p.id] ?? 0;
        row.totalKills += Math.max(0, Math.floor(pk));
        row.matchesPlayed += 1;
      }
    }
  }

  rows.sort(comparePlayers);
  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i]!;
    let strictlyBetter = 0;
    for (let j = 0; j < rows.length; j++) {
      if (comparePlayers(rows[j]!, cur) < 0) strictlyBetter++;
    }
    cur.rank = strictlyBetter + 1;
  }
  return rows;
}

export function getMvp(teams: Team[], matches: Match[]): PlayerStanding | null {
  const rows = computePlayerStandings(teams, matches);
  const top = rows[0];
  if (!top || top.totalKills <= 0) return null;
  return top;
}
