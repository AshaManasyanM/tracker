import type { Match, Team, Tournament } from "../types/tournament";
import { buildMatchLabelFromMeta, nextMatchDay } from "./matchDisplay";
import { newId } from "./id";
import { normalizeMatchTeamResult } from "./matchResultKills";

export function emptyResultsForTeams(teams: Team[]): Match["results"] {
  const results: Match["results"] = {};
  for (const t of teams) {
    results[t.id] = normalizeMatchTeamResult(t, { placement: null, kills: 0 });
  }
  return results;
}

export function createEmptyTournament(name: string): Tournament {
  const now = Date.now();
  const teams: Team[] = [];
  const firstMatch: Match = {
    id: newId("match"),
    label: "Day 1",
    day: 1,
    map: "",
    order: 0,
    results: {},
  };
  return {
    id: newId("tournament"),
    name,
    teams,
    matches: [firstMatch],
    activeMatchId: firstMatch.id,
    createdAt: now,
    updatedAt: now,
  };
}

/** Same as a fresh tournament but keeps the row id (cloud save / reset scores). */
export function forkEmptyTournamentKeepId(id: string, displayName: string): Tournament {
  const t = createEmptyTournament(displayName);
  return { ...t, id };
}

export function appendMatch(
  teams: Team[],
  matches: Match[],
  opts?: { day?: number },
): Match {
  const nextOrder =
    matches.length === 0 ? 0 : Math.max(...matches.map((m) => m.order)) + 1;
  const day =
    opts?.day != null && opts.day > 0 ? Math.floor(opts.day) : nextMatchDay(matches);
  const map = "";
  return {
    id: newId("match"),
    label: buildMatchLabelFromMeta(day, map, matches.length),
    day,
    map,
    order: nextOrder,
    results: emptyResultsForTeams(teams),
  };
}

export function ensureMatchResultsShape(
  match: Match,
  teams: Team[],
): Match {
  const next = { ...match, results: { ...match.results } };
  for (const t of teams) {
    const existing = next.results[t.id] ?? { placement: null, kills: 0 };
    next.results[t.id] = normalizeMatchTeamResult(t, existing);
  }
  for (const tid of Object.keys(next.results)) {
    if (!teams.some((x) => x.id === tid)) {
      delete next.results[tid];
    }
  }
  return next;
}

export function ensureAllMatchesShape(
  matches: Match[],
  teams: Team[],
): Match[] {
  return matches.map((m) => ensureMatchResultsShape(m, teams));
}
