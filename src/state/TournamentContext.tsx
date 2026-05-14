import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import type { MatchTeamResult, Team, Tournament } from "../types/tournament";
import { MAX_TEAMS } from "../types/tournament";
import { newId } from "../lib/id";
import { loadTournament, saveTournament } from "../lib/storage";
import {
  appendMatch,
  createEmptyTournament,
  ensureAllMatchesShape,
} from "../lib/tournamentDefaults";
import { MAX_PLAYERS_PER_TEAM, normalizeMatchTeamResult } from "../lib/matchResultKills";
import {
  distributeKillsEvenly,
  normalizeOcrToken,
  type OcrImportRow,
} from "../lib/ocrMatchImport";

export type TournamentAction =
  | { type: "renameTournament"; name: string }
  | { type: "addTeam"; name: string; tag?: string }
  | { type: "updateTeam"; teamId: string; name: string; tag?: string }
  | { type: "setTeamLogo"; teamId: string; logoDataUrl: string | null }
  | { type: "addPlayer"; teamId: string; name: string }
  | { type: "updatePlayer"; teamId: string; playerId: string; name: string }
  | { type: "removePlayer"; teamId: string; playerId: string }
  | { type: "removeTeam"; teamId: string }
  | { type: "reorderTeams"; teamIds: string[] }
  | { type: "addMatch" }
  | { type: "removeMatch"; matchId: string }
  | { type: "renameMatch"; matchId: string; label: string }
  | { type: "setActiveMatch"; matchId: string | null }
  | {
      type: "setMatchResult";
      matchId: string;
      teamId: string;
      patch: Partial<MatchTeamResult>;
    }
  | { type: "setMatchPlayerKills"; matchId: string; teamId: string; playerId: string; kills: number }
  | { type: "importOcrMatchSnapshot"; matchId: string; rows: OcrImportRow[] };

function reducer(state: Tournament, action: TournamentAction): Tournament {
  const touch = (t: Tournament): Tournament => ({ ...t, updatedAt: Date.now() });

  switch (action.type) {
    case "renameTournament":
      return touch({ ...state, name: action.name });
    case "addTeam": {
      if (state.teams.length >= MAX_TEAMS) return state;
      const team: Team = {
        id: newId("team"),
        name: action.name.trim() || `Team ${state.teams.length + 1}`,
        tag: action.tag?.trim() || undefined,
        players: [],
      };
      const matches = state.matches.map((m) => ({
        ...m,
        results: {
          ...m.results,
          [team.id]: normalizeMatchTeamResult(team, { placement: null, kills: 0 }),
        },
      }));
      return touch({ ...state, teams: [...state.teams, team], matches });
    }
    case "updateTeam": {
      const teams = state.teams.map((t) =>
        t.id === action.teamId
          ? {
              ...t,
              name: action.name.trim() || t.name,
              tag: action.tag?.trim() || undefined,
            }
          : t,
      );
      return touch({ ...state, teams });
    }
    case "setTeamLogo": {
      const teams = state.teams.map((t) =>
        t.id === action.teamId
          ? {
              ...t,
              logoDataUrl: action.logoDataUrl ?? undefined,
            }
          : t,
      );
      return touch({ ...state, teams });
    }
    case "addPlayer": {
      const team = state.teams.find((t) => t.id === action.teamId);
      if (!team) return state;
      const players = [...(team.players ?? [])];
      if (players.length >= MAX_PLAYERS_PER_TEAM) return state;
      const player = {
        id: newId("player"),
        name: action.name.trim() || `Player ${players.length + 1}`,
      };
      const nextTeam: Team = { ...team, players: [...players, player] };
      const teams = state.teams.map((t) => (t.id === team.id ? nextTeam : t));
      const matches = state.matches.map((m) => {
        const prev = m.results[team.id] ?? { placement: null, kills: 0 };
        const next = normalizeMatchTeamResult(nextTeam, prev);
        return { ...m, results: { ...m.results, [team.id]: next } };
      });
      return touch({ ...state, teams, matches });
    }
    case "updatePlayer": {
      const teams = state.teams.map((t) => {
        if (t.id !== action.teamId) return t;
        const players = (t.players ?? []).map((p) =>
          p.id === action.playerId ? { ...p, name: action.name.trim() || p.name } : p,
        );
        return { ...t, players };
      });
      return touch({ ...state, teams });
    }
    case "removePlayer": {
      const team = state.teams.find((t) => t.id === action.teamId);
      if (!team) return state;
      const nextPlayers = (team.players ?? []).filter((p) => p.id !== action.playerId);
      const nextTeam: Team = { ...team, players: nextPlayers };
      const teams = state.teams.map((t) => (t.id === team.id ? nextTeam : t));
      const matches = state.matches.map((m) => {
        const prev = m.results[team.id] ?? { placement: null, kills: 0 };
        const pk = { ...(prev.playerKills ?? {}) };
        delete pk[action.playerId];
        const next = normalizeMatchTeamResult(nextTeam, { ...prev, playerKills: pk });
        return { ...m, results: { ...m.results, [team.id]: next } };
      });
      return touch({ ...state, teams, matches });
    }
    case "removeTeam": {
      const teams = state.teams.filter((t) => t.id !== action.teamId);
      const matches = state.matches.map((m) => {
        const { [action.teamId]: _, ...rest } = m.results;
        return { ...m, results: rest };
      });
      let activeMatchId = state.activeMatchId;
      if (activeMatchId && !matches.some((x) => x.id === activeMatchId)) {
        activeMatchId = matches[0]?.id ?? null;
      }
      return touch({ ...state, teams, matches, activeMatchId });
    }
    case "reorderTeams": {
      const byId = new Map(state.teams.map((t) => [t.id, t] as const));
      const teams = action.teamIds.map((id) => byId.get(id)).filter(Boolean) as Team[];
      return touch({ ...state, teams });
    }
    case "addMatch": {
      const m = appendMatch(state.teams, state.matches);
      return touch({
        ...state,
        matches: [...state.matches, m],
        activeMatchId: m.id,
      });
    }
    case "removeMatch": {
      if (state.matches.length <= 1) return state;
      const matches = state.matches.filter((m) => m.id !== action.matchId);
      let activeMatchId = state.activeMatchId;
      if (activeMatchId === action.matchId) {
        activeMatchId = matches[0]?.id ?? null;
      }
      return touch({ ...state, matches, activeMatchId });
    }
    case "renameMatch": {
      const matches = state.matches.map((m) =>
        m.id === action.matchId ? { ...m, label: action.label } : m,
      );
      return touch({ ...state, matches });
    }
    case "setActiveMatch":
      return touch({ ...state, activeMatchId: action.matchId });
    case "setMatchResult": {
      const matches = state.matches.map((m) => {
        if (m.id !== action.matchId) return m;
        const team = state.teams.find((x) => x.id === action.teamId);
        if (!team) return m;
        const prev = m.results[action.teamId] ?? { placement: null, kills: 0 };
        const { kills: patchKills, playerKills: _ignoredPk, ...restPatch } = action.patch;
        void _ignoredPk;
        let next: MatchTeamResult = { ...prev, ...restPatch };
        const roster = team.players ?? [];
        if (patchKills !== undefined && roster.length === 0) {
          next.kills = Math.max(0, Math.floor(Number(patchKills) || 0));
        }
        if (action.patch.placement !== undefined) {
          const p = action.patch.placement;
          next.placement = p === null ? null : Math.max(1, Math.floor(p));
        }
        if (next.placement === null && roster.length > 0) {
          next = normalizeMatchTeamResult(team, { ...next, placement: null });
        } else {
          next = normalizeMatchTeamResult(team, next);
        }
        return {
          ...m,
          results: { ...m.results, [action.teamId]: next },
        };
      });
      return touch({ ...state, matches });
    }
    case "setMatchPlayerKills": {
      const team = state.teams.find((t) => t.id === action.teamId);
      if (!team?.players?.some((p) => p.id === action.playerId)) return state;
      const matches = state.matches.map((m) => {
        if (m.id !== action.matchId) return m;
        const prev = m.results[action.teamId] ?? { placement: null, kills: 0 };
        const pk = { ...(prev.playerKills ?? {}) };
        pk[action.playerId] = Math.max(0, Math.floor(action.kills));
        const next = normalizeMatchTeamResult(team, { ...prev, playerKills: pk });
        return { ...m, results: { ...m.results, [action.teamId]: next } };
      });
      return touch({ ...state, matches });
    }
    case "importOcrMatchSnapshot": {
      const targetMatchId = action.matchId;
      if (!state.matches.some((m) => m.id === targetMatchId)) return state;

      let teams = [...state.teams];
      let matches = state.matches.map((m) => ({ ...m, results: { ...m.results } }));

      const createdIdByNorm = new Map<string, string>();

      const normsFromNewRows = [
        ...new Set(
          action.rows
            .filter((r): r is Extract<OcrImportRow, { kind: "new" }> => r.kind === "new")
            .map((r) => normalizeOcrToken(r.name))
            .filter(Boolean),
        ),
      ];

      for (const norm of normsFromNewRows) {
        const existing = teams.find((t) => normalizeOcrToken(t.name) === norm);
        if (existing) {
          createdIdByNorm.set(norm, existing.id);
          continue;
        }
        if (teams.length >= MAX_TEAMS) break;

        const sample = action.rows.find(
          (r): r is Extract<OcrImportRow, { kind: "new" }> =>
            r.kind === "new" && normalizeOcrToken(r.name) === norm,
        );
        if (!sample) continue;

        const team: Team = {
          id: newId("team"),
          name: sample.name.trim().slice(0, 120) || `Team ${teams.length + 1}`,
          players: [],
        };
        teams.push(team);
        createdIdByNorm.set(norm, team.id);
        matches = matches.map((m) => ({
          ...m,
          results: {
            ...m.results,
            [team.id]: normalizeMatchTeamResult(team, { placement: null, kills: 0 }),
          },
        }));
      }

      matches = matches.map((m) => {
        if (m.id !== targetMatchId) return m;
        const results = { ...m.results };
        for (const row of action.rows) {
          const teamId =
            row.kind === "existing"
              ? row.teamId
              : createdIdByNorm.get(normalizeOcrToken(row.name));
          if (!teamId) continue;
          const team = teams.find((t) => t.id === teamId);
          if (!team) continue;
          const prev = results[teamId] ?? { placement: null, kills: 0 };
          const roster = team.players ?? [];
          if (roster.length > 0) {
            const explicitPk =
              row.kind === "existing" &&
              row.playerKills &&
              Object.keys(row.playerKills).length > 0
                ? row.playerKills
                : null;
            if (explicitPk) {
              results[teamId] = normalizeMatchTeamResult(team, {
                ...prev,
                placement: row.placement,
                playerKills: explicitPk,
                kills: 0,
              });
            } else {
              const pk = distributeKillsEvenly(roster, row.kills);
              results[teamId] = normalizeMatchTeamResult(team, {
                ...prev,
                placement: row.placement,
                playerKills: pk,
                kills: 0,
              });
            }
          } else {
            results[teamId] = normalizeMatchTeamResult(team, {
              ...prev,
              placement: row.placement,
              kills: row.kills,
            });
          }
        }
        return { ...m, results };
      });

      return touch({ ...state, teams, matches });
    }
  }
}

type Ctx = {
  tournament: Tournament;
  dispatch: Dispatch<TournamentAction>;
  saveStatus: "idle" | "saving" | "saved" | "error";
};

const TournamentContext = createContext<Ctx | null>(null);

function getInitialState(): Tournament {
  const loaded = loadTournament();
  if (loaded) {
    const matches = ensureAllMatchesShape(loaded.matches, loaded.teams);
    const activeMatchId =
      loaded.activeMatchId && matches.some((m) => m.id === loaded.activeMatchId)
        ? loaded.activeMatchId
        : matches[0]?.id ?? null;
    return {
      ...loaded,
      matches,
      activeMatchId,
    };
  }
  return createEmptyTournament("New scrim");
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournament, dispatch] = useReducer(reducer, undefined, getInitialState);
  const [saveStatus, setSaveStatus] = useState<Ctx["saveStatus"]>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((t: Tournament) => {
    try {
      saveTournament(t);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, []);

  useEffect(() => {
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      persist(tournament);
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [tournament, persist]);

  const value = useMemo(
    () => ({ tournament, dispatch, saveStatus }),
    [tournament, dispatch, saveStatus],
  );

  return (
    <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
  );
}

export function useTournament(): Ctx {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used within TournamentProvider");
  return ctx;
}
