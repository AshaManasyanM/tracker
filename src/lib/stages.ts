import type { Match, StageKind, Team, Tournament, TournamentStage } from "../types/tournament";
import { computeStandings } from "./standings";

/** How many teams leave each group for the semifinals. */
export const GROUP_ADVANCE_COUNT = 4;
/** How many teams from each semifinal group reach the final. The rest play last chance. */
export const SEMIFINAL_ADVANCE_COUNT = 6;

export function tournamentStages(t: Tournament): TournamentStage[] {
  return t.stages ?? [];
}

export function groupStages(t: Tournament): TournamentStage[] {
  return tournamentStages(t).filter((s) => s.kind === "group");
}

/** Every squad sent up from the groups, before they are split into Semifinal A and B. */
export function semifieldStage(t: Tournament): TournamentStage | null {
  return tournamentStages(t).find((s) => s.kind === "semifield") ?? null;
}

export function semifinalStages(t: Tournament): TournamentStage[] {
  return tournamentStages(t).filter((s) => s.kind === "semifinal");
}

export function finalsStage(t: Tournament): TournamentStage | null {
  return tournamentStages(t).find((s) => s.kind === "final") ?? null;
}

export function lastChanceStage(t: Tournament): TournamentStage | null {
  return tournamentStages(t).find((s) => s.kind === "lastchance") ?? null;
}

/** Best `count` teams in this stage, using only that stage's matches. */
export function topTeamIds(t: Tournament, stage: TournamentStage, count: number): string[] {
  const rows = computeStandings(teamsInStage(t, stage), matchesInStage(t, stage));
  return rows.slice(0, Math.max(0, count)).map((row) => row.team.id);
}

/**
 * Top 4 from each group stage group.
 * Group A, C, … go to Semifinal A. Group B, D, … go to Semifinal B.
 * A single group is split 1st/3rd and 2nd/4th so both semifinal groups get teams.
 */
export function semifinalBuckets(t: Tournament): [string[], string[]] {
  const buckets: [string[], string[]] = [[], []];
  const groups = groupStages(t);
  groups.forEach((group, index) => {
    const top = topTeamIds(t, group, GROUP_ADVANCE_COUNT);
    if (groups.length === 1) {
      top.forEach((id, place) => buckets[place % 2]!.push(id));
      return;
    }
    for (const id of top) {
      if (!buckets[index % 2]!.includes(id)) buckets[index % 2]!.push(id);
    }
  });
  return buckets;
}

/** Top 6 from each semifinal group, and everyone else in those groups. */
export function finalAndLastChanceIds(t: Tournament): { finalIds: string[]; lastChanceIds: string[] } {
  const finalIds: string[] = [];
  const lastChanceIds: string[] = [];
  for (const stage of semifinalStages(t)) {
    const ranked = topTeamIds(t, stage, Number.POSITIVE_INFINITY);
    for (const id of ranked.slice(0, SEMIFINAL_ADVANCE_COUNT)) {
      if (!finalIds.includes(id)) finalIds.push(id);
    }
    for (const id of ranked.slice(SEMIFINAL_ADVANCE_COUNT)) {
      if (!finalIds.includes(id) && !lastChanceIds.includes(id)) lastChanceIds.push(id);
    }
  }
  return { finalIds, lastChanceIds };
}

/** Groups are in use. A lone leftover finals stage still counts so its matches stay separate. */
export function stagesEnabled(t: Tournament): boolean {
  return tournamentStages(t).length > 0;
}

export function activeStage(t: Tournament): TournamentStage | null {
  if (!stagesEnabled(t)) return null;
  const stages = tournamentStages(t);
  return (
    stages.find((s) => s.id === t.activeStageId) ??
    stages.find((s) => s.kind === "group") ??
    stages[0] ??
    null
  );
}

export function teamsInStage(t: Tournament, stage: TournamentStage): Team[] {
  const byId = new Map(t.teams.map((team) => [team.id, team]));
  const teams: Team[] = [];
  for (const id of stage.teamIds) {
    const team = byId.get(id);
    if (team) teams.push(team);
  }
  return teams;
}

export function matchesInStage(t: Tournament, stage: TournamentStage): Match[] {
  return t.matches.filter((m) => m.stageId === stage.id);
}

export function unassignedTeams(t: Tournament): Team[] {
  const grouped = new Set(groupStages(t).flatMap((s) => s.teamIds));
  return t.teams.filter((team) => !grouped.has(team.id));
}

export function stageById(t: Tournament, stageId: string | null | undefined): TournamentStage | null {
  if (!stageId) return null;
  return tournamentStages(t).find((s) => s.id === stageId) ?? null;
}

export type StageSlice = {
  enabled: boolean;
  active: TournamentStage | null;
  teams: Team[];
  matches: Match[];
};

/** Teams and matches the editor should show. Without groups, this is the whole tournament. */
export function stageSlice(t: Tournament): StageSlice {
  const active = activeStage(t);
  if (!active) {
    return { enabled: false, active: null, teams: t.teams, matches: t.matches };
  }
  return {
    enabled: true,
    active,
    teams: teamsInStage(t, active),
    matches: matchesInStage(t, active),
  };
}

function normalizeStageKind(kind: string): StageKind {
  if (kind === "semifield" || kind === "semifinal" || kind === "final" || kind === "lastchance") return kind;
  return "group";
}

function defaultStageName(kind: StageKind): string {
  if (kind === "final") return "Finals";
  if (kind === "semifield" || kind === "semifinal") return "Semifinal";
  if (kind === "lastchance") return "Last chance";
  return "Group";
}

/** Drop unknown teams, keep one finals and one last-chance stage, and clear match links to deleted stages. */
export function normalizeTournament(t: Tournament): Tournament {
  const teamIds = new Set(t.teams.map((team) => team.id));
  const raw = t.stages ?? [];
  if (raw.length === 0) {
    return { ...t, stages: undefined, activeStageId: null };
  }

  let finalsKept = false;
  let lastChanceKept = false;
  let semifieldKept = false;
  const stages: TournamentStage[] = [];
  const seenInGroups = new Set<string>();
  const seenInSemis = new Set<string>();
  for (const stage of raw) {
    const kind = normalizeStageKind(stage.kind);
    if (kind === "final") {
      if (finalsKept) continue;
      finalsKept = true;
    }
    if (kind === "lastchance") {
      if (lastChanceKept) continue;
      lastChanceKept = true;
    }
    if (kind === "semifield") {
      if (semifieldKept) continue;
      semifieldKept = true;
    }
    const ids: string[] = [];
    for (const id of stage.teamIds) {
      if (!teamIds.has(id)) continue;
      if (kind === "group") {
        if (seenInGroups.has(id)) continue;
        seenInGroups.add(id);
      }
      if (kind === "semifinal") {
        if (seenInSemis.has(id)) continue;
        seenInSemis.add(id);
      }
      if (!ids.includes(id)) ids.push(id);
    }
    stages.push({
      id: stage.id,
      kind,
      name: stage.name.trim() || defaultStageName(kind),
      teamIds: ids,
    });
  }
  const finalistIds = new Set(stages.find((s) => s.kind === "final")?.teamIds ?? []);
  for (const stage of stages) {
    if (stage.kind === "lastchance") {
      stage.teamIds = stage.teamIds.filter((id) => !finalistIds.has(id));
    }
  }

  if (stages.length === 0) {
    return {
      ...t,
      stages: undefined,
      activeStageId: null,
      matches: t.matches.map((m) => (m.stageId ? { ...m, stageId: undefined } : m)),
    };
  }

  const stageIds = new Set(stages.map((s) => s.id));
  const matches = t.matches.map((m) =>
    m.stageId && !stageIds.has(m.stageId) ? { ...m, stageId: undefined } : m,
  );
  const activeStageId = stageIds.has(t.activeStageId ?? "")
    ? t.activeStageId
    : (stages.find((s) => s.kind === "group") ?? stages[0])?.id ?? null;

  return { ...t, stages, matches, activeStageId };
}
