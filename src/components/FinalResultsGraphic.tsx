import { forwardRef } from "react";
import type { TeamStanding } from "../lib/standings";
import { TeamAvatar } from "./TeamAvatar";

export type FinalResultsGraphicProps = {
  tournamentName: string;
  rows: TeamStanding[];
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";

function rankAccent(rank: number): string {
  if (rank === 1) return "from-[#ffd54a]/35 via-[#c9a227]/12 to-transparent";
  if (rank === 2) return "from-slate-200/25 via-slate-400/10 to-transparent";
  if (rank === 3) return "from-amber-700/35 via-amber-900/10 to-transparent";
  return "from-white/[0.06] to-transparent";
}

function rankLabelClass(rank: number): string {
  if (rank === 1) return "text-[#ffe9a8]";
  if (rank === 2) return "text-slate-200";
  if (rank === 3) return "text-amber-200/90";
  return "text-slate-500";
}

function ResultsColumn({ rows, dense }: { rows: TeamStanding[]; dense: boolean }) {
  const rowPad = dense ? "py-2" : "py-2.5";
  const nameSize = dense ? "text-lg" : "text-xl";
  const statSize = dense ? "text-lg" : "text-xl";
  const rankNum = dense ? "text-2xl" : "text-3xl";

  return (
    <div className="min-w-0 flex-1">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr
            className="border-b border-white/15 bg-black/40 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c547]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            <th className={`w-14 ${rowPad} text-center`}>#</th>
            <th className={`${rowPad} px-2 text-left`}>Team</th>
            <th className={`w-[4.5rem] ${rowPad} text-right`}>W</th>
            <th className={`w-[4.5rem] ${rowPad} text-right`}>K</th>
            <th className={`w-[4rem] ${rowPad} text-right`}>PL</th>
            <th className={`w-[4.5rem] ${rowPad} pr-3 text-right`}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-2 py-8 text-center text-sm text-slate-500"
                style={{ fontFamily: FONT_BOARD }}
              >
                —
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr
                key={r.team.id}
                className={`border-b border-white/[0.06] bg-gradient-to-r ${rankAccent(r.rank)}`}
              >
                <td className={`px-1 text-center align-middle ${rowPad}`}>
                  <span
                    className={`font-display font-bold tabular-nums ${rankNum} ${rankLabelClass(r.rank)}`}
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    {r.rank}
                  </span>
                </td>
                <td className={`min-w-0 align-middle px-2 text-left ${rowPad}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <TeamAvatar team={r.team} size={dense ? "md" : "lg"} />
                    <div
                      className={`min-w-0 font-semibold leading-snug text-white ${nameSize}`}
                      style={{
                        fontFamily: FONT_BOARD,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        textTransform: "none",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {r.team.name}
                    </div>
                  </div>
                </td>
                <td
                  className={`pr-1 text-right align-middle font-mono text-[#ffb84d] ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD }}
                >
                  {r.chickenDinners}
                </td>
                <td
                  className={`pr-1 text-right align-middle font-mono font-semibold text-slate-100 ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD }}
                >
                  {r.totalKills}
                </td>
                <td
                  className={`pr-1 text-right align-middle font-mono text-slate-300 ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD }}
                >
                  {r.totalPlacementPoints}
                </td>
                <td
                  className={`pr-3 text-right align-middle font-mono font-bold text-[#5cf0d8] ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD }}
                >
                  {r.totalPoints}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const FinalResultsGraphic = forwardRef<HTMLDivElement, FinalResultsGraphicProps>(
  function FinalResultsGraphic({ tournamentName, rows }, ref) {
    const mid = rows.length === 0 ? 0 : Math.ceil(rows.length / 2);
    const leftRows = rows.slice(0, mid);
    const rightRows = rows.slice(mid);
    const maxColLen = Math.max(leftRows.length, rightRows.length, 1);
    const dense = maxColLen > 9;

    return (
      <div
        ref={ref}
        lang="en"
        className="relative box-border w-[1920px] min-h-[1080px] shrink-0 overflow-visible font-board text-slate-100 antialiased"
        style={{
          fontFeatureSettings: '"tnum" 1',
          backgroundColor: "#03060c",
          backgroundImage: `
            linear-gradient(165deg, #07162c 0%, #0a0f1c 42%, #04060e 100%),
            radial-gradient(ellipse 90% 55% at 50% -15%, rgba(232,197,71,0.2), transparent 55%),
            radial-gradient(ellipse 70% 40% at 100% 100%, rgba(0,180,200,0.07), transparent 50%)
          `,
          fontFamily: FONT_BOARD,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex min-h-[1080px] flex-col pl-12 pr-28 pb-10 pt-11">
          <header className="shrink-0 border-b border-white/10 pb-7">
            <div className="min-w-0 max-w-[1400px]">
              <p
                className="text-[12px] font-semibold tracking-[0.45em] text-[#e8c547]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                OFFICIAL STANDINGS
              </p>
              <h1
                className="mt-1 text-[5rem] font-bold leading-[0.95] tracking-[0.06em] text-[#fce9a6]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  textShadow:
                    "0 1px 0 #7a5a12, 0 4px 22px rgba(201,162,39,0.42), 0 0 36px rgba(255,236,180,0.18)",
                }}
              >
                FINAL RESULTS
              </h1>
              <p
                className="mt-3 max-w-[1100px] text-[1.85rem] font-semibold leading-snug text-slate-100"
                style={{
                  fontFamily: FONT_BOARD,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  letterSpacing: "0.02em",
                }}
              >
                {tournamentName || "Tournament"}
              </p>
            </div>
          </header>

          <div className="mt-5 min-h-0 flex-1">
            <div className="rounded-lg border border-white/[0.08] bg-black/22 pl-5 pr-14 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              {rows.length === 0 ? (
                <div
                  className="py-16 text-center font-display text-2xl text-slate-500"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  No teams in this tournament
                </div>
              ) : (
                <div className="flex gap-8">
                  <ResultsColumn rows={leftRows} dense={dense} />
                  <div className="w-px shrink-0 self-stretch bg-white/10" aria-hidden />
                  <ResultsColumn rows={rightRows} dense={dense} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

FinalResultsGraphic.displayName = "FinalResultsGraphic";
