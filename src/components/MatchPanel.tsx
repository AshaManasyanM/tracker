import { useEffect, useMemo, useState } from "react";
import { useTournament } from "../state/TournamentContext";
import type { Match } from "../types/tournament";

export function MatchPanel() {
  const { tournament, dispatch } = useTournament();
  const sorted = useMemo(
    () => [...tournament.matches].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    [tournament.matches],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Matches</h2>
          <p className="text-xs text-slate-500">
            Unlimited rounds — placements are unique per lobby (no two squads share a place); each squad has placement and elims.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-accent/35 bg-accent/10 px-3 py-2 text-sm font-medium text-accent-glow hover:bg-accent/15"
          onClick={() => dispatch({ type: "addMatch" })}
        >
          + Add match
        </button>
      </div>

      <ul className="divide-y divide-line rounded-xl border border-line bg-canvas-overlay shadow-panel">
        {sorted.map((m) => (
          <MatchRow key={m.id} match={m} canDelete={tournament.matches.length > 1} />
        ))}
      </ul>
    </div>
  );
}

function MatchRow({ match, canDelete }: { match: Match; canDelete: boolean }) {
  const { tournament, dispatch } = useTournament();
  const [label, setLabel] = useState(match.label);

  useEffect(() => {
    setLabel(match.label);
  }, [match.id, match.label]);

  const played = useMemo(() => {
    let c = 0;
    for (const t of tournament.teams) {
      const p = match.results[t.id]?.placement;
      if (p !== null && p !== undefined) c++;
    }
    return c;
  }, [match.results, tournament.teams]);

  return (
    <li className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="min-w-0 flex-1">
        <label className="block text-xs text-slate-500">
          Label
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() =>
              dispatch({
                type: "renameMatch",
                matchId: match.id,
                label: label.trim() || match.label,
              })
            }
            className="mt-1 w-full max-w-md rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100"
          />
        </label>
        <div className="mt-1 text-xs text-slate-500">
          {played}/{tournament.teams.length} teams with a placement
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
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
            if (!confirm(`Delete ${match.label}? This removes its points from totals.`)) return;
            dispatch({ type: "removeMatch", matchId: match.id });
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
