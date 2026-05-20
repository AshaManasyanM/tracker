import { useMemo } from "react";
import type { Match, Team } from "../types/tournament";
import { computePlayerStandings, getMvps } from "../lib/playerStats";
import { mvpTitleForGender } from "../lib/playerGender";
export function MvpStrip({
  teams,
  matches,
}: {
  teams: Team[];
  matches: Match[];
}) {
  const mvps = useMemo(() => getMvps(teams, matches), [teams, matches]);

  return (
    <div className="flex flex-col gap-2">
      {mvps.boy && (
        <MvpSummaryRow
          title={mvpTitleForGender("boy")}
          playerName={mvps.boy.playerName}
          teamName={mvps.boy.teamName}
          totalKills={mvps.boy.totalKills}
        />
      )}
      {mvps.girl && (
        <MvpSummaryRow
          title={mvpTitleForGender("girl")}
          playerName={mvps.girl.playerName}
          teamName={mvps.girl.teamName}
          totalKills={mvps.girl.totalKills}
        />
      )}
      {!mvps.boy && !mvps.girl && (
        <p className="rounded-lg border border-line/80 bg-canvas/40 px-3 py-2 text-xs text-slate-500">
          Boy and girl MVP leaders appear here after elims are logged.
        </p>
      )}
    </div>
  );
}

function MvpSummaryRow({
  title,
  playerName,
  teamName,
  totalKills,
}: {
  title: string;
  playerName: string;
  teamName: string;
  totalKills: number;
}) {
  return (
    <div className="rounded-lg border border-accent/25 bg-accent/5 px-3 py-2 text-xs text-slate-200">
      <span className="font-semibold text-accent-glow">{title}</span>{" "}
      <span className="font-medium text-slate-100">{playerName}</span>
      <span className="text-slate-500"> · {teamName}</span>
      <span className="font-mono tabular-nums text-accent"> · {totalKills} elims</span>
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
              <th className="py-1.5 px-2 text-center font-medium">M/F</th>
              <th className="py-1.5 pl-3 pr-2 text-left font-medium">Team</th>
              <th className="py-1.5 px-2 text-center font-medium">Elims</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  Set Boy or Girl on every player under Teams.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.playerId} className="border-t border-line/70 odd:bg-canvas/30">
                  <td className="align-middle py-1.5 pl-4 pr-2 text-center font-mono text-slate-500">
                    {r.rank}
                  </td>
                  <td className="align-middle py-1.5 pl-3 pr-2 text-left font-medium text-slate-100">
                    {r.playerName}
                  </td>
                  <td className="align-middle py-1.5 px-2 text-center text-slate-400">
                    {r.gender === "boy" ? "B" : "G"}
                  </td>
                  <td className="max-w-[120px] truncate align-middle py-1.5 pl-3 pr-2 text-left text-slate-400">
                    {r.teamName}
                  </td>
                  <td className="align-middle py-1.5 px-2 text-center font-mono tabular-nums text-accent">
                    {r.totalKills}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
