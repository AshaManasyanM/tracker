import { useMemo, useState } from "react";
import { useTournament } from "../state/TournamentContext";
import { Leaderboard } from "./Leaderboard";
import { MatchEntryGrid } from "./MatchEntryGrid";
import { MvpStrip, PlayerFraggerboard } from "./PlayerFraggerboard";
import { formatMatchDisplay, groupMatchesByDay } from "../lib/matchDisplay";
import { MatchDayPicker } from "./MatchDayPicker";
import { duplicatePlacementsInMatch } from "../lib/standings";

export function LiveConsole() {
  const { tournament, dispatch } = useTournament();
  const [teamSearch, setTeamSearch] = useState("");
  const sortedMatches = useMemo(
    () =>
      [...tournament.matches].sort(
        (a, b) =>
          (a.day ?? 999) - (b.day ?? 999) ||
          a.order - b.order ||
          a.id.localeCompare(b.id),
      ),
    [tournament.matches],
  );
  const activeId =
    tournament.activeMatchId && sortedMatches.some((m) => m.id === tournament.activeMatchId)
      ? tournament.activeMatchId
      : sortedMatches[0]?.id ?? null;
  const activeMatch = sortedMatches.find((m) => m.id === activeId) ?? null;
  const matchGroups = useMemo(() => groupMatchesByDay(sortedMatches), [sortedMatches]);

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
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-100">Match entry</h2>
            {activeMatch ? (
              <p className="mt-0.5 text-sm font-medium text-accent-glow">
                {formatMatchDisplay(activeMatch)}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-slate-500">No match selected</p>
            )}
            <p className="hidden text-xs text-slate-500 sm:block">
              Tab through cells after each game — totals refresh instantly across every round.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <label className="flex min-w-[120px] flex-1 items-center gap-2 text-xs text-slate-400 sm:max-w-[200px]">
              <span className="sr-only">Search teams</span>
              <input
                type="search"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search…"
                className="w-full min-w-0 rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600"
              />
            </label>
            <label className="hidden shrink-0 items-center gap-1.5 text-xs text-slate-400 md:flex">
              <span className="sr-only">Select match</span>
              <select
                value={activeId ?? ""}
                onChange={(e) =>
                  dispatch({ type: "setActiveMatch", matchId: e.target.value || null })
                }
                className="min-w-[160px] max-w-[min(100%,280px)] rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100 sm:min-w-[200px]"
              >
                {matchGroups.map((group) => (
                  <optgroup key={group.day} label={group.title}>
                    {group.matches.map((m) => (
                      <option key={m.id} value={m.id}>
                        {formatMatchDisplay(m)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="shrink-0 rounded-md border border-accent/35 bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent-glow hover:bg-accent/15"
              onClick={() => dispatch({ type: "addMatch" })}
            >
              + Match
            </button>
            <button
              type="button"
              disabled={!activeMatch || tournament.teams.length === 0}
              className="shrink-0 rounded-md border border-line bg-canvas-overlay px-3 py-1.5 text-sm text-slate-300 hover:border-warn/40 hover:text-warn disabled:cursor-not-allowed disabled:opacity-40"
              title="Clear placement and elims for the selected match"
              onClick={() => {
                if (!activeMatch) return;
                if (
                  !confirm(
                    `Clear all numbers for ${formatMatchDisplay(activeMatch)}? Other matches are unchanged.`,
                  )
                )
                  return;
                dispatch({ type: "clearMatchScores", matchId: activeMatch.id });
              }}
            >
              Clear match
            </button>
            <button
              type="button"
              disabled={tournament.teams.length === 0 || tournament.matches.length === 0}
              className="shrink-0 rounded-md border border-warn/30 bg-warn/10 px-3 py-1.5 text-sm text-warn hover:bg-warn/15 disabled:cursor-not-allowed disabled:opacity-40"
              title="Clear placement and elims for every match"
              onClick={() => {
                if (
                  !confirm(
                    "Reset all placement, elims, and points for every match? Teams and match list stay as they are.",
                  )
                )
                  return;
                dispatch({ type: "clearAllScores" });
              }}
            >
              Reset all numbers
            </button>
          </div>
          <div className="md:hidden">
            <MatchDayPicker
              matches={sortedMatches}
              activeId={activeId}
              onSelect={(matchId) => dispatch({ type: "setActiveMatch", matchId })}
            />
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
