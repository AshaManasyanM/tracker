import { forwardRef } from "react";
import { formatStandingRank, type TeamStanding } from "../lib/standings";
import {
  GRAPHIC_OFFICIAL_BG,
  GRAPHIC_OFFICIAL_GOLD,
  GRAPHIC_OFFICIAL_GOLD_RGB,
} from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FinalResultsGraphicOfficialProps = {
  tournamentName: string;
  rows: TeamStanding[];
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";

const TEXT_DIM = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.45)`;
const HEAD_TEXT = "rgba(220, 228, 240, 0.82)";
const HEADER_BORDER = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.2)`;
const PANEL_BORDER = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.22)`;
const PANEL_BG = `linear-gradient(165deg, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.1) 0%, ${GRAPHIC_OFFICIAL_BG} 35%, ${GRAPHIC_OFFICIAL_BG} 100%)`;
const PANEL_SHADOW = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.15) 0px 1px 0px inset, rgba(0, 0, 0, 0.4) 0px 8px 32px`;
const ROW_BORDER = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.12)`;
const ROW_GRADIENT_LEADER = `linear-gradient(90deg, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.34) 0%, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.14) 40%, ${GRAPHIC_OFFICIAL_BG} 100%)`;
const ROW_GRADIENT = `linear-gradient(90deg, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.22) 0%, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.08) 45%, ${GRAPHIC_OFFICIAL_BG} 100%)`;
const COLUMN_DIVIDER = `linear-gradient(rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.08), rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.35), rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.08))`;

const ROOT_BG_IMAGE = `linear-gradient(165deg, ${GRAPHIC_OFFICIAL_BG} 0%, ${GRAPHIC_OFFICIAL_BG} 100%), radial-gradient(80% 45% at 50% -8%, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.12), transparent 55%)`;

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rowBackground(s: TeamStanding): string {
  if (!hasStandingsData(s)) return ROW_GRADIENT;
  return s.rank === 1 ? ROW_GRADIENT_LEADER : ROW_GRADIENT;
}

function OfficialResultsColumn({ rows, dense }: { rows: TeamStanding[]; dense: boolean }) {
  const rowPadY = dense ? 6 : 8;
  const headPy = dense ? 10 : 14;
  const headFontPx = dense ? 11 : 14;
  const statFontPx = dense ? 16 : 18;
  const teamLogoPx = dense ? 36 : 40;
  const teamNamePx = dense ? 16 : 18;
  const rankFontPx = dense ? 22 : 24;
  const rowHeight = dense ? 48 : 52;
  const cellMiddle = { verticalAlign: "middle" as const };
  const statCell = { ...cellMiddle, whiteSpace: "nowrap" as const };
  const headTh = {
    fontFamily: FONT_DISPLAY,
    color: HEAD_TEXT,
    backgroundColor: GRAPHIC_OFFICIAL_BG,
    whiteSpace: "nowrap" as const,
    lineHeight: 1.1,
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
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
          <tr style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.12)` }}>
            <th
              className="pl-4 pr-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              #
            </th>
            <th
              className="pl-3 pr-2 text-left"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Team
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              WW
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Elims
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Place pts
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
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
            rows.map((r) => (
              <tr
                key={r.team.id}
                style={{
                  height: rowHeight,
                  borderBottom: `1px solid ${ROW_BORDER}`,
                  background: rowBackground(r),
                }}
              >
                <td
                  className="pl-4 pr-2 text-center"
                  style={{ ...cellMiddle, paddingTop: rowPadY, paddingBottom: rowPadY }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: FONT_DISPLAY,
                      fontSize: rankFontPx,
                      fontWeight: 700,
                      lineHeight: 1,
                      color: r.matchesPlayed === 0 ? TEXT_DIM : GRAPHIC_OFFICIAL_GOLD,
                    }}
                  >
                    {formatStandingRank(r)}
                  </span>
                </td>
                <td
                  className="min-w-0 pl-3 pr-2 text-left"
                  style={{ ...cellMiddle, paddingTop: rowPadY, paddingBottom: rowPadY }}
                >
                  <GraphicTeamRow
                    team={r.team}
                    align="left"
                    logoPx={teamLogoPx}
                    nameFontSize={teamNamePx}
                    nameColor={GRAPHIC_OFFICIAL_GOLD}
                    gapPx={dense ? 10 : 12}
                    maxNameWidth={360}
                  />
                </td>
                <td
                  className="px-2 text-center font-mono"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_OFFICIAL_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.chickenDinners}
                </td>
                <td
                  className="px-2 text-center font-mono font-semibold"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_OFFICIAL_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.totalKills}
                </td>
                <td
                  className="px-2 text-center font-mono"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_OFFICIAL_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.totalPlacementPoints}
                </td>
                <td
                  className="px-2 text-center font-mono font-bold"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: hasStandingsData(r) ? GRAPHIC_OFFICIAL_GOLD : TEXT_DIM,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
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

export const FinalResultsGraphicOfficial = forwardRef<
  HTMLDivElement,
  FinalResultsGraphicOfficialProps
>(function FinalResultsGraphicOfficial({ tournamentName, rows }, ref) {
  const mid = rows.length === 0 ? 0 : Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, mid);
  const rightRows = rows.slice(mid);
  const maxColLen = Math.max(leftRows.length, rightRows.length, 1);
  const dense = maxColLen > 9;

  return (
    <div
      ref={ref}
      data-graphic-capture
      lang="en"
      className="relative box-border w-[1920px] min-h-[1080px] shrink-0 overflow-visible font-board antialiased"
      style={{
        fontFeatureSettings: '"tnum" 1',
        lineHeight: "normal",
        color: GRAPHIC_OFFICIAL_GOLD,
        backgroundColor: GRAPHIC_OFFICIAL_BG,
        backgroundImage: ROOT_BG_IMAGE,
        fontFamily: FONT_BOARD,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.28,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div
        className="relative z-10 flex min-h-[1080px] flex-col pb-10 pt-11"
        style={{ paddingLeft: 48, paddingRight: 112 }}
      >
        <header className="shrink-0 border-b pb-7" style={{ borderColor: HEADER_BORDER }}>
          <p
            style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: GRAPHIC_OFFICIAL_GOLD,
            }}
          >
            Official standings
          </p>
          <h1
            style={{
              margin: "4px 0 0",
              fontFamily: FONT_DISPLAY,
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: GRAPHIC_OFFICIAL_GOLD,
              textShadow: `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.25) 0px 2px 20px`,
            }}
          >
            Group stage results
          </h1>
          <p
            style={{
              margin: "12px 0 0",
              fontFamily: FONT_BOARD,
              fontSize: 30,
              fontWeight: 600,
              lineHeight: 1.35,
              letterSpacing: "0.02em",
              color: GRAPHIC_OFFICIAL_GOLD,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
          >
            {tournamentName || "Tournament"}
          </p>
        </header>

        <div className="mt-5 min-h-0 flex-1">
          <div
            className="rounded-lg border"
            style={{
              borderColor: PANEL_BORDER,
              padding: "20px 56px 20px 20px",
              background: PANEL_BG,
              boxShadow: PANEL_SHADOW,
            }}
          >
            {rows.length === 0 ? (
              <div
                style={{
                  padding: "64px 0",
                  textAlign: "center",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 24,
                  color: TEXT_DIM,
                }}
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
                    <OfficialResultsColumn rows={leftRows} dense={dense} />
                  </div>
                  <div
                    style={{
                      display: "table-cell",
                      width: 8,
                      verticalAlign: "top",
                      background: COLUMN_DIVIDER,
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
                    <OfficialResultsColumn rows={rightRows} dense={dense} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FinalResultsGraphicOfficial.displayName = "FinalResultsGraphicOfficial";
