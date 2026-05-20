import { useEffect, useMemo, useState } from "react";
import { formatMatchDisplay, groupMatchesByDay } from "../lib/matchDisplay";
import { useTournament } from "../state/TournamentContext";
import type { Match } from "../types/tournament";

const MAP_SUGGESTIONS = ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik", "Karakin"];

export function MatchPanel() {
  const { tournament, dispatch } = useTournament();
  const groups = useMemo(() => groupMatchesByDay(tournament.matches), [tournament.matches]);
  const activeDay = tournament.matches.find((m) => m.id === tournament.activeMatchId)?.day;
  const [openDays, setOpenDays] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (activeDay != null && activeDay > 0) initial.add(activeDay);
    else if (groups[0]?.day != null) initial.add(groups[0].day);
    return initial;
  });

  useEffect(() => {
    if (activeDay != null && activeDay > 0) {
      setOpenDays((prev) => new Set(prev).add(activeDay));
    }
  }, [activeDay]);

  const toggleDay = (day: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Matches</h2>
          <p className="text-xs text-slate-500">
            Lobbies are grouped by <span className="text-slate-400">day</span>; each map is a
            separate match (e.g. Day 1 — Erangel).
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-accent/35 bg-accent/10 px-3 py-2 text-sm font-medium text-accent-glow hover:bg-accent/15"
          onClick={() => dispatch({ type: "addMatch" })}
        >
          + Add day
        </button>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <DayAccordion
            key={group.day}
            group={group}
            open={openDays.has(group.day)}
            onToggle={() => toggleDay(group.day)}
            canDelete={tournament.matches.length > 1}
          />
        ))}
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-slate-500">No matches yet.</p>
      )}
    </div>
  );
}

function DayAccordion({
  group,
  open,
  onToggle,
  canDelete,
}: {
  group: { day: number; title: string; matches: Match[] };
  open: boolean;
  onToggle: () => void;
  canDelete: boolean;
}) {
  const { dispatch } = useTournament();
  const dayNum = group.day > 0 ? group.day : undefined;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas-overlay shadow-panel">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-3 text-left hover:bg-canvas-raised sm:px-4"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span
          className={`text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden
        >
          ▶
        </span>
        <span className="min-w-0 flex-1 font-medium text-slate-100">{group.title}</span>
        <span className="shrink-0 text-xs text-slate-500">
          {group.matches.length} map{group.matches.length === 1 ? "" : "s"}
        </span>
      </button>

      {open && (
        <div className="border-t border-line">
          <ul className="divide-y divide-line">
            {group.matches.map((m) => (
              <MapRow
                key={m.id}
                match={m}
                fixedDay={dayNum}
                canDelete={canDelete}
              />
            ))}
          </ul>
          <div className="border-t border-line px-3 py-2 sm:px-4">
            <button
              type="button"
              className="text-sm text-accent-glow hover:underline"
              onClick={() =>
                dispatch({
                  type: "addMatch",
                  ...(dayNum != null ? { day: dayNum } : {}),
                })
              }
            >
              + Add map
              {dayNum != null ? ` to Day ${dayNum}` : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MapRow({
  match,
  fixedDay,
  canDelete,
}: {
  match: Match;
  fixedDay?: number;
  canDelete: boolean;
}) {
  const { tournament, dispatch } = useTournament();
  const [map, setMap] = useState(match.map ?? "");

  useEffect(() => {
    setMap(match.map ?? "");
  }, [match.id, match.map]);

  const commitMap = (nextMap: string) => {
    dispatch({
      type: "updateMatch",
      matchId: match.id,
      patch: {
        map: nextMap,
        ...(fixedDay != null ? { day: fixedDay } : {}),
      },
    });
  };

  const played = useMemo(() => {
    let c = 0;
    for (const t of tournament.teams) {
      const p = match.results[t.id]?.placement;
      if (p !== null && p !== undefined) c++;
    }
    return c;
  }, [match.results, tournament.teams]);

  const preview = formatMatchDisplay(match);

  return (
    <li className="flex flex-col gap-3 px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-medium text-slate-400">Live console:</span>
        <span className="text-slate-200">{preview}</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-0 flex-1 text-xs text-slate-500">
          Map
          <input
            list={`maps-${match.id}`}
            value={map}
            placeholder="Erangel"
            onChange={(e) => setMap(e.target.value)}
            onBlur={() => commitMap(map)}
            className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100"
          />
          <datalist id={`maps-${match.id}`}>
            {MAP_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <button
            type="button"
            className="rounded-md border border-line px-3 py-1.5 text-sm text-slate-200 hover:bg-canvas-raised"
            onClick={() => dispatch({ type: "setActiveMatch", matchId: match.id })}
          >
            Open in Live
          </button>
          <button
            type="button"
            disabled={!canDelete}
            title={!canDelete ? "Keep at least one match" : undefined}
            className="rounded-md border border-danger/30 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              if (!confirm(`Delete ${preview}? This removes its points from totals.`)) return;
              dispatch({ type: "removeMatch", matchId: match.id });
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-xs text-slate-500">
        {played}/{tournament.teams.length} teams with a placement
      </div>
    </li>
  );
}
