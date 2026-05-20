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
import { newId } from "../lib/id";
import { loadTournament, saveTournament } from "../lib/storage";
import { describeSupabaseFetchError } from "../lib/supabaseErrors";
import { saveTournamentRow, fetchTournamentById } from "../lib/tournamentDb";
import { buildMatchLabelFromMeta } from "../lib/matchDisplay";
import {
  appendMatch,
  createEmptyTournament,
  emptyResultsForTeams,
  ensureAllMatchesShape,
} from "../lib/tournamentDefaults";
import {
  applyExclusivePlacement,
  dedupePlacementsByTeamListOrder,
} from "../lib/matchPlacementUnique";
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
  | { type: "addMatch"; day?: number }
  | { type: "removeMatch"; matchId: string }
  | { type: "renameMatch"; matchId: string; label: string }
  | {
      type: "updateMatch";
      matchId: string;
      patch: { day?: number | null; map?: string };
    }
  | { type: "setActiveMatch"; matchId: string | null }
  | {
      type: "setMatchResult";
      matchId: string;
      teamId: string;
      patch: Partial<MatchTeamResult>;
    }
  | { type: "setMatchPlayerKills"; matchId: string; teamId: string; playerId: string; kills: number }
  | { type: "importOcrMatchSnapshot"; matchId: string; rows: OcrImportRow[] }
  | { type: "clearAllScores" }
  | { type: "clearMatchScores"; matchId: string }
  | { type: "hydrate"; tournament: Tournament };

function reducer(state: Tournament, action: TournamentAction): Tournament {
  const touch = (t: Tournament): Tournament => ({ ...t, updatedAt: Date.now() });

  switch (action.type) {
    case "hydrate": {
      const matches = ensureAllMatchesShape(action.tournament.matches, action.tournament.teams);
      const activeMatchId =
        action.tournament.activeMatchId && matches.some((m) => m.id === action.tournament.activeMatchId)
          ? action.tournament.activeMatchId
          : matches[0]?.id ?? null;
      return {
        ...action.tournament,
        matches,
        activeMatchId,
        updatedAt: Date.now(),
      };
    }
    case "renameTournament":
      return touch({ ...state, name: action.name });
    case "addTeam": {
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
      const m = appendMatch(state.teams, state.matches, { day: action.day });
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
    case "updateMatch": {
      const matches = state.matches.map((m) => {
        if (m.id !== action.matchId) return m;
        const day =
          action.patch.day === null
            ? undefined
            : action.patch.day !== undefined
              ? Math.max(1, Math.floor(action.patch.day))
              : m.day;
        const map = action.patch.map !== undefined ? action.patch.map.trim() : m.map;
        const label = buildMatchLabelFromMeta(day, map, m.order);
        return { ...m, day, map, label };
      });
      return touch({ ...state, matches });
    }
    case "setActiveMatch":
      return touch({ ...state, activeMatchId: action.matchId });
    case "clearAllScores": {
      const empty = emptyResultsForTeams(state.teams);
      const matches = state.matches.map((m) => ({ ...m, results: { ...empty } }));
      return touch({ ...state, matches });
    }
    case "clearMatchScores": {
      const empty = emptyResultsForTeams(state.teams);
      const matches = state.matches.map((m) =>
        m.id === action.matchId ? { ...m, results: { ...empty } } : m,
      );
      return touch({ ...state, matches });
    }
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
        const placementPatched = action.patch.placement !== undefined;
        const results =
          placementPatched && next.placement !== null
            ? applyExclusivePlacement(m.results, state.teams, action.teamId, next)
            : { ...m.results, [action.teamId]: next };
        return {
          ...m,
          results,
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
        const deduped = dedupePlacementsByTeamListOrder(results, teams);
        return { ...m, results: deduped };
      });

      return touch({ ...state, teams, matches });
    }
    default:
      return state;
  }
}

type Ctx = {
  tournament: Tournament;
  dispatch: Dispatch<TournamentAction>;
  saveStatus: "idle" | "saving" | "saved" | "error";
  persistMode: "local" | "remote";
};

const TournamentContext = createContext<Ctx | null>(null);

function getInitialStateLocal(): Tournament {
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

function getInitialRemotePlaceholder(tournamentId: string): Tournament {
  const t = createEmptyTournament("Loading…");
  return { ...t, id: tournamentId };
}

export type TournamentPersist =
  | { mode: "local" }
  | { mode: "remote"; tournamentId: string };

export function TournamentProvider({
  children,
  persist = { mode: "local" },
}: {
  children: ReactNode;
  persist?: TournamentPersist;
}) {
  const persistRemote = persist.mode === "remote";
  const remoteTournamentId = persistRemote ? persist.tournamentId : "";

  const [tournament, dispatch] = useReducer(
    reducer,
    undefined,
    persistRemote
      ? () => getInitialRemotePlaceholder(remoteTournamentId)
      : getInitialStateLocal,
  );

  const [saveStatus, setSaveStatus] = useState<Ctx["saveStatus"]>("idle");
  const [remoteReady, setRemoteReady] = useState(!persistRemote);
  const [remoteLoadError, setRemoteLoadError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!persistRemote) {
      setRemoteReady(true);
      setRemoteLoadError(null);
      return;
    }
    let cancelled = false;
    setRemoteReady(false);
    setRemoteLoadError(null);
    void (async () => {
      try {
        const t = await fetchTournamentById(remoteTournamentId);
        if (cancelled) return;
        if (t) dispatch({ type: "hydrate", tournament: t });
        else setRemoteLoadError("This tournament could not be loaded or you do not have access.");
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Load failed.";
          setRemoteLoadError(describeSupabaseFetchError(msg));
        }
      } finally {
        if (!cancelled) setRemoteReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistRemote, remoteTournamentId]);

  const persistFn = useCallback(
    async (t: Tournament) => {
      if (persistRemote) {
        try {
          await saveTournamentRow(t);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      } else {
        try {
          saveTournament(t);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }
    },
    [persistRemote],
  );

  useEffect(() => {
    if (persistRemote && !remoteReady) return;
    if (persistRemote && remoteLoadError) return;
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void persistFn(tournament);
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [tournament, persistFn, persistRemote, remoteReady, remoteLoadError]);

  const value = useMemo(
    () => ({
      tournament,
      dispatch,
      saveStatus,
      persistMode: persistRemote ? "remote" as const : "local" as const,
    }),
    [tournament, dispatch, saveStatus, persistRemote],
  );

  if (persistRemote && !remoteReady) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-sm text-slate-500">
        Loading tournament…
      </div>
    );
  }

  if (persistRemote && remoteLoadError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-danger">{remoteLoadError}</p>
        <a
          href="/"
          className="mt-6 inline-block rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent-glow hover:bg-accent/20"
        >
          Back to dashboard
        </a>
      </div>
    );
  }

  return (
    <TournamentContext.Provider value={value}>{children}</TournamentContext.Provider>
  );
}

export function useTournament(): Ctx {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error("useTournament must be used within TournamentProvider");
  return ctx;
}
