import { KILL_POINTS_PER_ELIMINATION, placementPointsByRank } from "../lib/scoring";

export function RulesPanel() {
  const rows = Object.entries(placementPointsByRank)
    .map(([k, v]) => ({ place: Number(k), pts: v }))
    .sort((a, b) => a.place - b.place);

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-100">Scoring rules</h2>
        <p className="mt-1 text-sm text-slate-400">
          Default table mirrors common{" "}
          <span className="text-slate-300">PMGC-style league</span> placement points plus per-kill
          scoring. Edit <code className="rounded bg-canvas-overlay px-1 py-0.5 text-xs">src/lib/scoring.ts</code>{" "}
          if your organizer publishes a different chart.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-canvas-overlay shadow-panel">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas-raised/70 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">Placement</th>
              <th className="px-3 py-2 text-right font-medium">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.place} className="border-b border-line/70 odd:bg-canvas/40">
                <td className="px-3 py-2 font-mono text-slate-200">
                  {r.place === 1
                    ? "1st"
                    : r.place === 2
                      ? "2nd"
                      : r.place === 3
                        ? "3rd"
                        : `${r.place}th`}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-accent">
                  {r.pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-400">
        Eliminations:{" "}
        <span className="font-mono text-accent">{KILL_POINTS_PER_ELIMINATION}</span> point each,
        added on top of placement points every match.
      </p>
      <p className="text-sm text-slate-400">
        Standings ties: same <span className="text-slate-300">total pts</span> → higher{" "}
        <span className="text-slate-300">place pts</span> ranks above; then elims, best single
        finish, then WW count.
      </p>
    </div>
  );
}
