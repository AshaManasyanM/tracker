import { useMemo, useState } from "react";
import { useTournament } from "../state/TournamentContext";
import { Leaderboard } from "./Leaderboard";
import { MatchEntryGrid } from "./MatchEntryGrid";
import { MvpStrip, PlayerFraggerboard } from "./PlayerFraggerboard";
import { duplicatePlacementsInMatch } from "../lib/standings";

export function LiveConsole() {
  const { tournament, dispatch } = useTournament();
  const [teamSearch, setTeamSearch] = useState("");
  const sortedMatches = useMemo(
    () => [...tournament.matches].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    [tournament.matches],
  );
  const activeId =
    tournament.activeMatchId && sortedMatches.some((m) => m.id === tournament.activeMatchId)
      ? tournament.activeMatchId
      : sortedMatches[0]?.id ?? null;
  const activeMatch = sortedMatches.find((m) => m.id === activeId) ?? null;

  const dupes = useMemo(() => {
    if (!activeMatch) return new Map<number, string[]>();
    return duplicatePlacementsInMatch(
      activeMatch,
      tournament.teams.map((t) => t.id),
    );
  }, [activeMatch, tournament.teams]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px]">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Match entry</h2>
            <p className="text-xs text-slate-500">
              Tab through cells after each game — totals refresh instantly across every round.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-[140px] flex-1 items-center gap-2 text-xs text-slate-400 sm:max-w-[200px]">
              <span className="sr-only">Search teams</span>
              <input
                type="search"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search teams…"
                className="w-full rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden sm:inline">Active match</span>
              <select
                value={activeId ?? ""}
                onChange={(e) =>
                  dispatch({ type: "setActiveMatch", matchId: e.target.value || null })
                }
                className="max-w-[220px] rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100"
              >
                {sortedMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="rounded-md border border-accent/35 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-glow hover:bg-accent/15"
              onClick={() => dispatch({ type: "addMatch" })}
            >
              + Match
            </button>
          </div>
        </div>

        {activeMatch ? (
          <MatchEntryGrid match={activeMatch} teamSearch={teamSearch} />
        ) : (
          <div className="rounded-xl border border-line bg-canvas-overlay p-4 text-sm text-slate-400">
            No matches yet.
          </div>
        )}

        {dupes.size > 0 && (
          <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
            Duplicate placements in this match:{" "}
            {[...dupes.entries()]
              .map(([place, ids]) => `P${place} ×${ids.length}`)
              .join(" · ")}
            . Fix before locking scores.
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-3 lg:sticky lg:top-3 lg:self-start">
        <MvpStrip teams={tournament.teams} matches={tournament.matches} />
        <Leaderboard teams={tournament.teams} matches={tournament.matches} />
        <PlayerFraggerboard teams={tournament.teams} matches={tournament.matches} />
      </aside>
    </div>
  );
}
