import { forwardRef } from "react";
import { formatStandingRank, type TeamStanding } from "../lib/standings";
import {
  ALPHA7_LOGO_URL,
  GRAPHIC_BG,
  GRAPHIC_GOLD,
  GRAPHIC_GOLD_RGB,
  GRAPHIC_TEXT,
  GRAPHIC_TEXT_MUTED,
  RESULTS_EXPORT_W,
} from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FinalResultsGraphicProps = {
  tournamentName: string;
  rows: TeamStanding[];
  /** Competition day shown on the graphic (e.g. 1 → "Day 1"). */
  day: number;
  matchCurrent: number;
  matchTotal: number;
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";

const TEXT_DIM = `rgba(${GRAPHIC_GOLD_RGB}, 0.42)`;
const TABLE_PANEL_BG = `rgba(${GRAPHIC_GOLD_RGB}, 0.08)`;
const TABLE_HEAD_BG = `rgba(${GRAPHIC_GOLD_RGB}, 0.12)`;
const HEAD_TEXT = GRAPHIC_TEXT_MUTED;

const ROW_ACTIVE = `rgba(${GRAPHIC_GOLD_RGB}, 0.14)`;
const ROW_ACTIVE_LEADER = `rgba(${GRAPHIC_GOLD_RGB}, 0.24)`;
const ROW_EMPTY_EVEN = `rgba(${GRAPHIC_GOLD_RGB}, 0.03)`;
const ROW_EMPTY_ODD = `rgba(255, 255, 255, 0.015)`;

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
  return GRAPHIC_GOLD;
}

function ResultsColumn({
  rows,
  dense,
  portrait = false,
}: {
  rows: TeamStanding[];
  dense: boolean;
  portrait?: boolean;
}) {
  const rowPadY = portrait ? (dense ? 5 : 6) : dense ? 5 : 6;
  const headPy = portrait ? (dense ? 9 : 10) : dense ? 8 : 10;
  const headFontPx = portrait ? (dense ? 11 : 12) : dense ? 10 : 11;
  const statFontPx = portrait ? (dense ? 16 : 18) : dense ? 15 : 17;
  const teamLogoPx = portrait ? (dense ? 34 : 38) : dense ? 34 : 38;
  const teamNamePx = portrait ? (dense ? 15 : 17) : dense ? 15 : 16;
  const rankFontPx = portrait ? (dense ? 20 : 22) : dense ? 20 : 24;
  const rowHeight = Math.max(
    portrait ? (dense ? 44 : 48) : dense ? 44 : 48,
    teamLogoPx + rowPadY * 2 + 4,
  );
  const placeHeadFontPx = portrait ? (dense ? 10 : 11) : dense ? 9 : 10;
  const cellMiddle = { verticalAlign: "middle" as const };
  const statCell = { ...cellMiddle, whiteSpace: "nowrap" as const };
  const headTh = {
    fontFamily: FONT_DISPLAY,
    color: HEAD_TEXT,
    backgroundColor: TABLE_HEAD_BG,
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
          {portrait ? (
            <>
              <col style={{ width: 48 }} />
              <col />
              <col style={{ width: 52 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 64 }} />
              <col style={{ width: 72 }} />
              <col style={{ width: 76 }} />
            </>
          ) : (
            <>
              <col style={{ width: 44 }} />
              <col />
              <col style={{ width: 50 }} />
              <col style={{ width: 86 }} />
              <col style={{ width: 62 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 76 }} />
            </>
          )}
        </colgroup>
        <thead>
          <tr
            className="border-b font-display font-bold uppercase"
            style={{
              borderColor: `rgba(${GRAPHIC_GOLD_RGB}, 0.22)`,
              backgroundColor: TABLE_HEAD_BG,
              letterSpacing: "0.12em",
              fontSize: headFontPx,
            }}
          >
            <th
              className="pl-3 pr-1 text-center"
              style={{ ...headTh, paddingTop: headPy, paddingBottom: headPy }}
            >
              #
            </th>
            <th
              className="pl-2 pr-1 text-left"
              style={{ ...headTh, paddingTop: headPy, paddingBottom: headPy }}
            >
              Team
            </th>
            <th
              className="px-1 text-center"
              style={{ ...headTh, paddingTop: headPy, paddingBottom: headPy }}
            >
              WW
            </th>
            <th
              className="px-1 text-center"
              style={{
                ...headTh,
                whiteSpace: "normal",
                fontSize: placeHeadFontPx,
                letterSpacing: "0.08em",
                lineHeight: 1.15,
                paddingTop: headPy,
                paddingBottom: headPy,
                paddingLeft: 4,
                paddingRight: 4,
              }}
            >
              <span style={{ display: "block" }}>Matches</span>
              <span style={{ display: "block" }}>played</span>
            </th>
            <th
              className="px-1 text-center"
              style={{ ...headTh, paddingTop: headPy, paddingBottom: headPy }}
            >
              Elims
            </th>
            <th
              className="px-1 text-center"
              style={{
                ...headTh,
                whiteSpace: "normal",
                fontSize: placeHeadFontPx,
                lineHeight: 1.15,
                paddingTop: headPy,
                paddingBottom: headPy,
              }}
            >
              <span style={{ display: "block" }}>Place</span>
              <span style={{ display: "block" }}>pts</span>
            </th>
            <th
              className="px-1 text-center"
              style={{
                ...headTh,
                whiteSpace: "normal",
                fontSize: placeHeadFontPx,
                lineHeight: 1.15,
                paddingTop: headPy,
                paddingBottom: headPy,
              }}
            >
              <span style={{ display: "block" }}>Total</span>
              <span style={{ display: "block" }}>pts</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
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
                  borderColor: `rgba(${GRAPHIC_GOLD_RGB}, 0.1)`,
                  backgroundColor: rowBackground(r, i),
                }}
              >
                <td
                  className="pl-4 pr-2 text-center"
                  style={{
                    ...cellMiddle,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  <span
                    className="inline-block font-display font-bold tabular-nums"
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: rankFontPx,
                      lineHeight: 1,
                      color: rankColor(r),
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
                    gapPx={dense ? 8 : 10}
                  />
                </td>
                <td
                  className="px-1 text-center font-mono"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.chickenDinners}
                </td>
                <td
                  className="px-1 text-center font-mono"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.matchesPlayed}
                </td>
                <td
                  className="px-1 text-center font-mono font-semibold"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.totalKills}
                </td>
                <td
                  className="px-1 text-center font-mono"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: GRAPHIC_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.totalPlacementPoints}
                </td>
                <td
                  className="px-1 text-center font-mono font-bold"
                  style={{
                    fontFamily: FONT_BOARD,
                    fontSize: statFontPx,
                    color: hasStandingsData(r) ? GRAPHIC_GOLD : TEXT_DIM,
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

const HEADER_LOGO_H = 160;

function HeaderBrandLogo({ compact = false }: { compact?: boolean }) {
  const maxW = compact ? 150 : 300;
  const h = compact ? 56 : HEADER_LOGO_H;
  return (
    <img
      src={ALPHA7_LOGO_URL}
      alt=""
      width={maxW}
      height={h}
      loading="eager"
      decoding="sync"
      style={{
        display: "block",
        height: h,
        width: "auto",
        maxWidth: maxW,
        objectFit: "contain",
        backgroundColor: "transparent",
      }}
    />
  );
}

const PORTRAIT = RESULTS_EXPORT_W <= 1080;
const SIDE_PAD = PORTRAIT ? 36 : 56;

export const FinalResultsGraphic = forwardRef<HTMLDivElement, FinalResultsGraphicProps>(
  function FinalResultsGraphic({ tournamentName, rows, day, matchCurrent, matchTotal }, ref) {
    const dayNum = Math.max(1, Math.floor(day));
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
          color: GRAPHIC_TEXT,
          backgroundColor: GRAPHIC_BG,
          fontFamily: FONT_BOARD,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            backgroundColor: GRAPHIC_GOLD,
          }}
        />
        <div
          className="relative z-10 flex flex-col pb-8 pt-10"
          style={{
            paddingLeft: SIDE_PAD,
            paddingRight: SIDE_PAD,
            boxSizing: "border-box",
          }}
        >
          <header
            className="shrink-0 pb-6"
            style={{ borderBottom: `2px solid rgba(${GRAPHIC_GOLD_RGB}, 0.35)` }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: `rgba(${GRAPHIC_GOLD_RGB}, 0.75)`,
              }}
            >
              Official standings
            </p>
            <div
              style={{
                display: "table",
                width: "100%",
                marginTop: 10,
                borderCollapse: "collapse",
              }}
            >
              <div style={{ display: "table-row" }}>
                <div
                  style={{
                    display: "table-cell",
                    verticalAlign: "middle",
                    paddingRight: 32,
                  }}
                >
                  <h1
                    style={{
                      margin: 0,
                      fontFamily: FONT_DISPLAY,
                      fontSize: PORTRAIT ? 52 : 88,
                      fontWeight: 700,
                      lineHeight: 0.95,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: GRAPHIC_GOLD,
                    }}
                  >
                    Final results
                  </h1>
                  <p
                    style={{
                      margin: PORTRAIT ? "8px 0 0" : "10px 0 0",
                      fontFamily: FONT_DISPLAY,
                      fontSize: PORTRAIT ? 15 : 18,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: `rgba(${GRAPHIC_GOLD_RGB}, 0.82)`,
                      lineHeight: 1.1,
                    }}
                  >
                    MATCH {matchCurrent}/{matchTotal}
                  </p>
                  <p
                    style={{
                      margin: PORTRAIT ? "6px 0 0" : "8px 0 0",
                      fontFamily: FONT_DISPLAY,
                      fontSize: PORTRAIT ? 28 : 44,
                      fontWeight: 600,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: `rgba(${GRAPHIC_GOLD_RGB}, 0.9)`,
                      lineHeight: 1.1,
                    }}
                  >
                    Day {dayNum}
                  </p>
                </div>
                <div
                  style={{
                    display: "table-cell",
                    verticalAlign: "middle",
                    width: PORTRAIT ? 160 : 320,
                    textAlign: "right",
                    lineHeight: 0,
                  }}
                >
                  <HeaderBrandLogo compact={PORTRAIT} />
                </div>
              </div>
            </div>
            <p
              style={{
                margin: "12px 0 0",
                maxWidth: RESULTS_EXPORT_W - SIDE_PAD * 2,
                fontFamily: FONT_BOARD,
                fontSize: PORTRAIT ? 22 : 30,
                fontWeight: 600,
                lineHeight: 1.25,
                color: GRAPHIC_TEXT,
                wordBreak: "break-word",
                letterSpacing: "0.02em",
              }}
            >
              {tournamentName || "Tournament"}
            </p>
          </header>

          <div className="mt-4">
            <div
              style={{
                border: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.25)`,
                borderRadius: 8,
                padding: PORTRAIT ? "10px 12px 12px" : "14px 16px 16px",
                backgroundColor: TABLE_PANEL_BG,
                boxShadow: `inset 0 1px 0 rgba(${GRAPHIC_GOLD_RGB}, 0.12), 0 12px 40px rgba(0,0,0,0.45)`,
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
                <ResultsColumn rows={rows} dense={dense} portrait={PORTRAIT} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

FinalResultsGraphic.displayName = "FinalResultsGraphic";
