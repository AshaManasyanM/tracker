import type { Match, Team, Tournament, TournamentStage } from "../types/tournament";

export function tournamentStages(t: Tournament): TournamentStage[] {
  return t.stages ?? [];
}

export function groupStages(t: Tournament): TournamentStage[] {
  return tournamentStages(t).filter((s) => s.kind === "group");
}

export function finalsStage(t: Tournament): TournamentStage | null {
  return tournamentStages(t).find((s) => s.kind === "final") ?? null;
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

/** Drop unknown teams, keep one finals stage, and clear match links to deleted stages. */
export function normalizeTournament(t: Tournament): Tournament {
  const teamIds = new Set(t.teams.map((team) => team.id));
  const raw = t.stages ?? [];
  if (raw.length === 0) {
    return { ...t, stages: undefined, activeStageId: null };
  }

  let finalsKept = false;
  const stages: TournamentStage[] = [];
  const seenInGroups = new Set<string>();
  for (const stage of raw) {
    const kind = stage.kind === "final" ? "final" : "group";
    if (kind === "final") {
      if (finalsKept) continue;
      finalsKept = true;
    }
    const ids: string[] = [];
    for (const id of stage.teamIds) {
      if (!teamIds.has(id)) continue;
      if (kind === "group") {
        if (seenInGroups.has(id)) continue;
        seenInGroups.add(id);
      }
      if (!ids.includes(id)) ids.push(id);
    }
    stages.push({
      id: stage.id,
      kind,
      name: stage.name.trim() || (kind === "final" ? "Finals" : "Group"),
      teamIds: ids,
    });
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
