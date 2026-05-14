import type { Match, Team } from "../types/tournament";
import { matchPointsForTeam } from "./scoring";
import { effectiveTeamKills } from "./matchResultKills";

export type TeamStanding = {
  team: Team;
  rank: number;
  totalPoints: number;
  totalKills: number;
  totalPlacementPoints: number;
  matchesPlayed: number;
  /** Best finish in any single match (1 = best); Infinity if none */
  bestPlacement: number;
  /** Count of 1st place finishes */
  chickenDinners: number;
};

function compareStandings(a: TeamStanding, b: TeamStanding): number {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
  if (a.bestPlacement !== b.bestPlacement) return a.bestPlacement - b.bestPlacement;
  return b.chickenDinners - a.chickenDinners;
}

export function computeStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  const rows: TeamStanding[] = teams.map((team) => {
    let totalPoints = 0;
    let totalKills = 0;
    let totalPlacementPoints = 0;
    let matchesPlayed = 0;
    let bestPlacement = Number.POSITIVE_INFINITY;
    let chickenDinners = 0;

    for (const m of matches) {
      const r = m.results[team.id];
      if (!r || r.placement === null) continue;
      matchesPlayed++;
      const elim = effectiveTeamKills(team, r);
      const { placementPts, total } = matchPointsForTeam(r.placement, elim);
      totalPoints += total;
      totalKills += elim;
      totalPlacementPoints += placementPts;
      if (r.placement < bestPlacement) bestPlacement = r.placement;
      if (r.placement === 1) chickenDinners++;
    }

    return {
      team,
      rank: 0,
      totalPoints,
      totalKills,
      totalPlacementPoints,
      matchesPlayed,
      bestPlacement: Number.isFinite(bestPlacement) ? bestPlacement : 999,
      chickenDinners,
    };
  });

  rows.sort(compareStandings);
  for (let i = 0; i < rows.length; i++) {
    const cur = rows[i]!;
    let strictlyBetter = 0;
    for (let j = 0; j < rows.length; j++) {
      if (compareStandings(rows[j]!, cur) < 0) strictlyBetter++;
    }
    cur.rank = strictlyBetter + 1;
  }
  return rows;
}

/** Returns teamIds that share the same placement value within a match (data issues). */
export function duplicatePlacementsInMatch(
  match: Match,
  teamIds: string[],
): Map<number, string[]> {
  const byPlace = new Map<number, string[]>();
  for (const tid of teamIds) {
    const p = match.results[tid]?.placement;
    if (p === null || p === undefined) continue;
    const list = byPlace.get(p) ?? [];
    list.push(tid);
    byPlace.set(p, list);
  }
  const dups = new Map<number, string[]>();
  for (const [place, ids] of byPlace) {
    if (ids.length > 1) dups.set(place, ids);
  }
  return dups;
}
