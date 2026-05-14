import { useMemo } from "react";
import type { Match, Team } from "../types/tournament";
import { computeStandings } from "../lib/standings";
import { TeamAvatar } from "./TeamAvatar";

export function Leaderboard({
  teams,
  matches,
  compact,
}: {
  teams: Team[];
  matches: Match[];
  compact?: boolean;
}) {
  const rows = useMemo(() => computeStandings(teams, matches), [teams, matches]);

  if (teams.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-canvas-overlay p-4 text-sm text-slate-400">
        Add teams to see standings.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas-overlay shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-3 py-2 sm:px-4">
        <h2 className="text-sm font-semibold text-slate-100">Live standings</h2>
        <span className="text-xs text-slate-500">{matches.length} matches</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas-raised/60 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium sm:px-3">#</th>
              <th className="px-2 py-2 font-medium sm:px-3">Team</th>
              <th className="px-2 py-2 text-right font-medium sm:px-3">PTS</th>
              {!compact && (
                <>
                  <th className="hidden px-2 py-2 text-right font-medium sm:table-cell sm:px-3">
                    PL
                  </th>
                  <th className="px-2 py-2 text-right font-medium sm:px-3">K</th>
                  <th className="hidden px-2 py-2 text-right font-medium md:table-cell md:px-3">
                    M
                  </th>
                  <th className="hidden px-2 py-2 text-right font-medium lg:table-cell lg:px-3">
                    WWCD
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.team.id}
                className="border-b border-line/70 odd:bg-canvas/40 hover:bg-canvas-raised/40"
              >
                <td className="px-2 py-2 font-mono text-xs text-slate-400 sm:px-3 sm:text-sm">
                  {r.rank}
                </td>
                <td className="px-2 py-2 sm:px-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamAvatar team={r.team} size="sm" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-slate-100">{r.team.name}</span>
                      {r.team.tag && (
                        <span className="truncate text-xs text-slate-500">{r.team.tag}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums text-accent-glow sm:px-3">
                  {r.totalPoints}
                </td>
                {!compact && (
                  <>
                    <td className="hidden px-2 py-2 text-right font-mono tabular-nums text-slate-300 sm:table-cell sm:px-3">
                      {r.totalPlacementPoints}
                    </td>
                    <td className="px-2 py-2 text-right font-mono tabular-nums text-slate-200 sm:px-3">
                      {r.totalKills}
                    </td>
                    <td className="hidden px-2 py-2 text-right font-mono text-slate-400 md:table-cell md:px-3">
                      {r.matchesPlayed}
                    </td>
                    <td className="hidden px-2 py-2 text-right font-mono text-warn/90 lg:table-cell lg:px-3">
                      {r.chickenDinners}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
