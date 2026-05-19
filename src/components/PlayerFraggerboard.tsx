import { useMemo } from "react";
import type { Match, Team } from "../types/tournament";
import { computePlayerStandings, getMvp } from "../lib/playerStats";

export function MvpStrip({ teams, matches }: { teams: Team[]; matches: Match[] }) {
  const mvp = useMemo(() => getMvp(teams, matches), [teams, matches]);
  if (!mvp) {
    return (
      <div className="rounded-lg border border-line bg-canvas-overlay px-3 py-2 text-xs text-slate-500">
        MVP unlocks once rosters have elim data (add players under Teams, then log kills per match).
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-xs text-slate-200">
      <p className="min-w-0">
        <span className="font-semibold text-accent-glow">MVP</span>{" "}
        <span className="font-medium text-slate-100">{mvp.playerName}</span>
        <span className="text-slate-500"> · {mvp.teamName}</span>
      </p>
      <span className="shrink-0 font-mono tabular-nums text-accent">{mvp.totalKills} elims</span>
    </div>
  );
}

export function PlayerFraggerboard({ teams, matches }: { teams: Team[]; matches: Match[] }) {
  const rows = useMemo(() => computePlayerStandings(teams, matches), [teams, matches]);
  const hasRoster = teams.some((t) => (t.players?.length ?? 0) > 0);

  if (!hasRoster) {
    return (
      <div className="rounded-xl border border-line bg-canvas-overlay p-3 text-xs text-slate-500">
        Add players on the <span className="text-slate-400">Teams</span> tab to track per-player
        elims and MVP.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas-overlay shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-100">Fraggerboard</h2>
        <span className="text-xs text-slate-500">Per-player elims</span>
      </div>
      <div className="max-h-[280px] overflow-y-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-[1] bg-canvas-raised/95 text-[10px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1.5 pl-4 pr-2 text-center font-medium">#</th>
              <th className="py-1.5 pl-3 pr-2 text-left font-medium">Player</th>
              <th className="py-1.5 pl-3 pr-2 text-left font-medium">Team</th>
              <th className="py-1.5 px-2 text-center font-medium">Elims</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.playerId} className="border-t border-line/70 odd:bg-canvas/30">
                <td className="align-middle py-1.5 pl-4 pr-2 text-center font-mono text-slate-500">{r.rank}</td>
                <td className="align-middle py-1.5 pl-3 pr-2 text-left font-medium text-slate-100">{r.playerName}</td>
                <td className="max-w-[120px] truncate align-middle py-1.5 pl-3 pr-2 text-left text-slate-400">{r.teamName}</td>
                <td className="align-middle py-1.5 px-2 text-center font-mono tabular-nums text-accent">{r.totalKills}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
