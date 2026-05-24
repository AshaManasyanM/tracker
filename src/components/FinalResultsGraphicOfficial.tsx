import { forwardRef } from "react";
import { formatStandingRank, type TeamStanding } from "../lib/standings";
import {
  GRAPHIC_OFFICIAL_BG,
  GRAPHIC_OFFICIAL_GOLD,
  GRAPHIC_OFFICIAL_GOLD_RGB,
  RESULTS_EXPORT_W,
} from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FinalResultsGraphicOfficialProps = {
  tournamentName: string;
  rows: TeamStanding[];
  matchCurrent: number;
  matchTotal: number;
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

const ROOT_BG_IMAGE = `linear-gradient(165deg, ${GRAPHIC_OFFICIAL_BG} 0%, ${GRAPHIC_OFFICIAL_BG} 100%), radial-gradient(80% 45% at 50% -8%, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.12), transparent 55%)`;

const PORTRAIT = RESULTS_EXPORT_W <= 1080;
const SIDE_PAD = PORTRAIT ? 32 : 48;

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rowBackground(s: TeamStanding): string {
  if (!hasStandingsData(s)) return ROW_GRADIENT;
  return s.rank === 1 ? ROW_GRADIENT_LEADER : ROW_GRADIENT;
}

function OfficialResultsColumn({
  rows,
  dense,
  portrait = false,
}: {
  rows: TeamStanding[];
  dense: boolean;
  portrait?: boolean;
}) {
  const rowPadY = portrait ? (dense ? 6 : 7) : dense ? 6 : 8;
  const headPy = portrait ? (dense ? 10 : 12) : dense ? 10 : 14;
  const headFontPx = portrait ? (dense ? 12 : 13) : dense ? 11 : 14;
  const statFontPx = portrait ? (dense ? 17 : 19) : dense ? 16 : 18;
  const teamLogoPx = portrait ? (dense ? 36 : 40) : dense ? 36 : 40;
  const teamNamePx = portrait ? (dense ? 16 : 18) : dense ? 16 : 18;
  const rankFontPx = portrait ? (dense ? 22 : 24) : dense ? 22 : 24;
  const rowHeight = Math.max(
    portrait ? (dense ? 46 : 50) : dense ? 48 : 52,
    teamLogoPx + rowPadY * 2 + 4,
  );
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
          {portrait ? (
            <>
              <col style={{ width: 52 }} />
              <col />
              <col style={{ width: 64 }} />
              <col style={{ width: 64 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 96 }} />
            </>
          ) : (
            <>
              <col style={{ width: 56 }} />
              <col />
              <col style={{ width: 76 }} />
              <col style={{ width: 76 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
            </>
          )}
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
                  className="pl-2 pr-1 text-left"
                  style={{
                    ...cellMiddle,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                    overflow: "hidden",
                    maxWidth: 0,
                  }}
                >
                  <GraphicTeamRow
                    team={r.team}
                    align="left"
                    logoPx={teamLogoPx}
                    nameFontSize={teamNamePx}
                    nameColor={GRAPHIC_OFFICIAL_GOLD}
                    gapPx={dense ? 10 : 12}
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
>(function FinalResultsGraphicOfficial(
  { tournamentName, rows, matchCurrent, matchTotal },
  ref,
) {
  const dense = rows.length > (PORTRAIT ? 16 : 12);

  return (
    <div
      ref={ref}
      data-graphic-capture
      lang="en"
      className="relative box-border shrink-0 overflow-visible font-board antialiased"
      style={{
        width: RESULTS_EXPORT_W,
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
        className="relative z-10 flex flex-col pb-8 pt-10"
        style={{
          paddingLeft: SIDE_PAD,
          paddingRight: SIDE_PAD,
          boxSizing: "border-box",
        }}
      >
        <header className="shrink-0 border-b pb-5" style={{ borderColor: HEADER_BORDER }}>
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
              fontSize: PORTRAIT ? 50 : 80,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: GRAPHIC_OFFICIAL_GOLD,
              textShadow: `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.25) 0px 2px 20px`,
            }}
          >
            Final results
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: FONT_DISPLAY,
              fontSize: PORTRAIT ? 14 : 16,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.82)`,
            }}
          >
            MATCH {matchCurrent}/{matchTotal}
          </p>
          <p
            style={{
              margin: "10px 0 0",
              fontFamily: FONT_BOARD,
              fontSize: PORTRAIT ? 22 : 30,
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

        <div className="mt-4">
          <div
            className="rounded-lg border"
            style={{
              borderColor: PANEL_BORDER,
              padding: PORTRAIT ? "12px 14px" : "20px 56px 20px 20px",
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
              <OfficialResultsColumn rows={rows} dense={dense} portrait={PORTRAIT} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FinalResultsGraphicOfficial.displayName = "FinalResultsGraphicOfficial";
