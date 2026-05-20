import { forwardRef } from "react";
import { formatStandingRank, type TeamStanding } from "../lib/standings";
import { TeamAvatar } from "./TeamAvatar";

export type FinalResultsGraphicProps = {
  tournamentName: string;
  rows: TeamStanding[];
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";

/** Graphic table palette */
const BG = "#070b14";
const GOLD = "#E6C15A";
const GOLD_RGB = "230, 193, 90";
const TEXT_DIM = `rgba(${GOLD_RGB}, 0.45)`;

const TABLE_PANEL_BG = `linear-gradient(165deg, rgba(${GOLD_RGB}, 0.1) 0%, ${BG} 35%, ${BG} 100%)`;
const HEAD_TEXT = "rgba(220, 228, 240, 0.82)";

/** Gold wash on dark base for teams with placement or points */
const ROW_ACTIVE = `linear-gradient(90deg, rgba(${GOLD_RGB}, 0.22) 0%, rgba(${GOLD_RGB}, 0.08) 45%, ${BG} 100%)`;
const ROW_ACTIVE_LEADER = `linear-gradient(90deg, rgba(${GOLD_RGB}, 0.34) 0%, rgba(${GOLD_RGB}, 0.14) 40%, ${BG} 100%)`;
const ROW_EMPTY_EVEN = `linear-gradient(90deg, rgba(255,255,255,0.03) 0%, ${BG} 100%)`;
const ROW_EMPTY_ODD = "#0c101c";

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rowBackground(s: TeamStanding, index: number): string {
  if (!hasStandingsData(s)) {
    return index % 2 === 0 ? ROW_EMPTY_EVEN : ROW_EMPTY_ODD;
  }
  return s.rank === 1 ? ROW_ACTIVE_LEADER : ROW_ACTIVE;
}

function rankColor(s: TeamStanding): string {
  if (s.matchesPlayed === 0) return TEXT_DIM;
  return GOLD;
}

/** Table-cell layout survives html2canvas on mobile; flex inside <td> often stacks misaligned. */
function GraphicTeamCell({
  team,
  dense,
  nameSize,
}: {
  team: TeamStanding["team"];
  dense: boolean;
  nameSize: string;
}) {
  const avatarPx = dense ? 44 : 52;
  const nameGap = dense ? 36 : 48;
  return (
    <div
      style={{
        display: "table",
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
      }}
    >
      <div style={{ display: "table-row" }}>
        <div
          style={{
            display: "table-cell",
            width: avatarPx,
            verticalAlign: "middle",
            paddingRight: nameGap,
            lineHeight: 0,
          }}
        >
          <TeamAvatar team={team} size={dense ? "md" : "lg"} priority />
        </div>
        <div
          style={{
            display: "table-cell",
            verticalAlign: "middle",
            lineHeight: 1.25,
            paddingLeft: 12,
          }}
        >
          <div
            className={`font-semibold ${nameSize}`}
            style={{
              fontFamily: FONT_BOARD,
              color: GOLD,
              wordBreak: "break-word",
              overflowWrap: "break-word",
              letterSpacing: "0.01em",
            }}
          >
            {team.name}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsColumn({ rows, dense }: { rows: TeamStanding[]; dense: boolean }) {
  const rowPad = dense ? "py-2" : "py-2.5";
  const headPad = dense ? "py-3.5" : "py-4";
  const headText = dense ? "text-sm" : "text-base";
  const nameSize = dense ? "text-lg" : "text-xl";
  const statSize = dense ? "text-lg" : "text-xl";
  const rankNum = dense ? "text-2xl" : "text-3xl";
  const rowHeight = dense ? 52 : 60;
  const cellMiddle = { verticalAlign: "middle" as const };
  const statCell = { ...cellMiddle, whiteSpace: "nowrap" as const };
  const headTh = {
    fontFamily: FONT_DISPLAY,
    color: HEAD_TEXT,
    backgroundColor: BG,
    whiteSpace: "nowrap" as const,
    lineHeight: 1.1,
  };

  return (
    <div className="min-w-0 flex-1" style={{ lineHeight: "normal" }}>
      <table
        className="w-full border-collapse text-left"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <colgroup>
          <col style={{ width: 56 }} />
          <col />
          <col style={{ width: 76 }} />
          <col style={{ width: 76 }} />
          <col style={{ width: 100 }} />
          <col style={{ width: 100 }} />
        </colgroup>
        <thead>
          <tr
            className={`border-b font-display font-bold uppercase tracking-[0.14em] ${headText}`}
            style={{
              borderColor: "rgba(255, 255, 255, 0.12)",
              backgroundColor: BG,
            }}
          >
            <th className={`w-14 pl-4 pr-2 ${headPad} text-center`} style={headTh}>
              #
            </th>
            <th className={`pl-3 pr-2 ${headPad} text-left`} style={headTh}>
              Team
            </th>
            <th className={`px-2 ${headPad} text-center`} style={headTh}>
              WW
            </th>
            <th className={`px-2 ${headPad} text-center`} style={headTh}>
              Elims
            </th>
            <th className={`px-2 ${headPad} text-center`} style={headTh}>
              Place pts
            </th>
            <th className={`px-2 ${headPad} text-center`} style={headTh}>
              Total pts
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-2 py-8 text-center text-sm"
                style={{ fontFamily: FONT_BOARD, color: TEXT_DIM }}
              >
                —
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={r.team.id}
                className="border-b"
                style={{
                  height: rowHeight,
                  borderColor: `rgba(${GOLD_RGB}, 0.12)`,
                  background: rowBackground(r, i),
                }}
              >
                <td className={`pl-4 pr-2 text-center ${rowPad}`} style={cellMiddle}>
                  <span
                    className={`inline-block font-display font-bold tabular-nums ${rankNum}`}
                    style={{
                      fontFamily: FONT_DISPLAY,
                      lineHeight: 1,
                      color: rankColor(r),
                    }}
                  >
                    {formatStandingRank(r)}
                  </span>
                </td>
                <td className={`min-w-0 pl-3 pr-2 text-left ${rowPad}`} style={cellMiddle}>
                  <GraphicTeamCell team={r.team} dense={dense} nameSize={nameSize} />
                </td>
                <td
                  className={`px-2 text-center font-mono ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD, color: GOLD, ...statCell }}
                >
                  {r.chickenDinners}
                </td>
                <td
                  className={`px-2 text-center font-mono font-semibold ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD, color: GOLD, ...statCell }}
                >
                  {r.totalKills}
                </td>
                <td
                  className={`px-2 text-center font-mono ${rowPad} ${statSize}`}
                  style={{ fontFamily: FONT_BOARD, color: GOLD, ...statCell }}
                >
                  {r.totalPlacementPoints}
                </td>
                <td
                  className={`px-2 text-center font-mono font-bold ${rowPad} ${statSize}`}
                  style={{
                    fontFamily: FONT_BOARD,
                    color: hasStandingsData(r) ? GOLD : TEXT_DIM,
                    ...statCell,
                  }}
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
        className="relative box-border w-[1920px] min-h-[1080px] shrink-0 overflow-visible font-board antialiased"
        style={{
          fontFeatureSettings: '"tnum" 1',
          lineHeight: "normal",
          color: GOLD,
          backgroundColor: BG,
          backgroundImage: `
            linear-gradient(165deg, ${BG} 0%, ${BG} 100%),
            radial-gradient(ellipse 80% 45% at 50% -8%, rgba(${GOLD_RGB}, 0.12), transparent 55%)
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
          <header className="shrink-0 border-b pb-7" style={{ borderColor: `rgba(${GOLD_RGB}, 0.2)` }}>
            <div className="min-w-0 max-w-[1400px]">
              <p
                className="text-[12px] font-semibold tracking-[0.45em]"
                style={{ fontFamily: FONT_DISPLAY, color: GOLD }}
              >
                OFFICIAL STANDINGS
              </p>
              <h1
                className="mt-1 text-[5rem] font-bold leading-[0.95] tracking-[0.06em]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  color: GOLD,
                  textShadow: `0 2px 20px rgba(${GOLD_RGB}, 0.25)`,
                }}
              >
                GROUP STAGE RESULTS
              </h1>
              <p
                className="mt-3 max-w-[1100px] text-[1.85rem] font-semibold leading-snug"
                style={{
                  fontFamily: FONT_BOARD,
                  color: GOLD,
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
            <div
              className="rounded-lg border pl-5 pr-14 py-5"
              style={{
                borderColor: `rgba(${GOLD_RGB}, 0.22)`,
                background: TABLE_PANEL_BG,
                boxShadow: `inset 0 1px 0 rgba(${GOLD_RGB}, 0.15), 0 8px 32px rgba(0,0,0,0.4)`,
              }}
            >
              {rows.length === 0 ? (
                <div
                  className="py-16 text-center font-display text-2xl"
                  style={{ fontFamily: FONT_DISPLAY, color: TEXT_DIM }}
                >
                  No teams in this tournament
                </div>
              ) : (
                <div
                  style={{
                    display: "table",
                    width: "100%",
                    tableLayout: "fixed",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <div style={{ display: "table-row" }}>
                    <div
                      style={{
                        display: "table-cell",
                        width: "50%",
                        verticalAlign: "top",
                        paddingRight: 16,
                      }}
                    >
                      <ResultsColumn rows={leftRows} dense={dense} />
                    </div>
                    <div
                      style={{
                        display: "table-cell",
                        width: 8,
                        verticalAlign: "top",
                        background: `linear-gradient(180deg, rgba(${GOLD_RGB}, 0.08), rgba(${GOLD_RGB}, 0.35), rgba(${GOLD_RGB}, 0.08))`,
                      }}
                      aria-hidden
                    />
                    <div
                      style={{
                        display: "table-cell",
                        width: "50%",
                        verticalAlign: "top",
                        paddingLeft: 16,
                      }}
                    >
                      <ResultsColumn rows={rightRows} dense={dense} />
                    </div>
                  </div>
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
