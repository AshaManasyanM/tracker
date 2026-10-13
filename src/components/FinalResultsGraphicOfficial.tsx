import { forwardRef, type CSSProperties } from "react";
import { formatStandingRank, type TeamStanding } from "../lib/standings";
import {
  GRAPHIC_OFFICIAL_BG,
  GRAPHIC_OFFICIAL_GOLD,
  GRAPHIC_OFFICIAL_GOLD_RGB,
  RESULTS_BG_URL,
  SPLIT_RESULTS_EXPORT_W,
} from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FinalResultsGraphicOfficialProps = {
  tournamentName: string;
  rows: TeamStanding[];
  matchCurrent: number;
  matchTotal: number;
};

const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";

const TEXT_DIM = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.45)`;
const HEAD_TEXT = "rgba(220, 228, 240, 0.82)";
const HEADER_BORDER = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.2)`;
const PANEL_BORDER = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.22)`;
const PANEL_BG = `linear-gradient(165deg, rgba(7, 11, 20, 0.9) 0%, rgba(7, 11, 20, 0.94) 100%)`;
const PANEL_SHADOW = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.15) 0px 1px 0px inset, rgba(0, 0, 0, 0.4) 0px 8px 32px`;
const ROW_BORDER = `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.12)`;
const ROW_GRADIENT_LEADER = `linear-gradient(90deg, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.38) 0%, rgba(7, 11, 20, 0.35) 100%)`;
const ROW_GRADIENT = `linear-gradient(90deg, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.16) 0%, rgba(7, 11, 20, 0.22) 100%)`;

const SIDE_PAD = 48;
const PHOTO_H = 240;

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rowBackground(s: TeamStanding): string {
  if (!hasStandingsData(s)) return ROW_GRADIENT;
  return s.rank === 1 ? ROW_GRADIENT_LEADER : ROW_GRADIENT;
}

function rangeTitle(start: number, count: number): string {
  if (count <= 0) return "—";
  const end = start + count - 1;
  return start === end ? String(start) : `${start}–${end}`;
}

function SplitColumn({
  title,
  rows,
  dense,
}: {
  title: string;
  rows: TeamStanding[];
  dense: boolean;
}) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0 }}>
      <p
        style={{
          margin: "0 0 8px",
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: GRAPHIC_OFFICIAL_GOLD,
        }}
      >
        {title}
      </p>
      <div
        className="rounded-lg border"
        style={{
          borderColor: PANEL_BORDER,
          padding: "10px 12px 12px",
          background: PANEL_BG,
          boxShadow: PANEL_SHADOW,
          minHeight: 120,
        }}
      >
        {rows.length === 0 ? (
          <p
            style={{
              margin: 0,
              padding: "28px 0",
              textAlign: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              color: TEXT_DIM,
            }}
          >
            —
          </p>
        ) : (
          <OfficialResultsColumn rows={rows} dense={dense} compact />
        )}
      </div>
    </div>
  );
}

function OfficialResultsColumn({
  rows,
  dense,
  compact = false,
}: {
  rows: TeamStanding[];
  dense: boolean;
  /** Narrow column for the 8–8 side-by-side board. */
  compact?: boolean;
}) {
  const rowPadY = compact ? 6 : dense ? 6 : 8;
  const headPy = compact ? 10 : dense ? 11 : 15;
  const headFontPx = compact ? 16 : dense ? 16 : 18;
  const bodyNumberFontPx = compact ? 24 : 28;
  const totalFontPx = compact ? 24 : dense ? 24 : 28;
  const teamLogoPx = compact ? 34 : dense ? 40 : 44;
  const teamNamePx = compact ? 20 : dense ? 22 : 24;
  const rowHeight = Math.max(compact ? 48 : dense ? 56 : 60, teamLogoPx + rowPadY * 2 + 4);
  const cellMiddle = { verticalAlign: "middle" as const };
  const statCell = { ...cellMiddle, whiteSpace: "nowrap" as const };
  const numberFontBase: CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 500,
    letterSpacing: "0.02em",
    lineHeight: 1,
    fontFeatureSettings: '"tnum" 1',
  };
  const headTh = {
    fontFamily: FONT_DISPLAY,
    color: HEAD_TEXT,
    backgroundColor: "transparent",
    whiteSpace: "nowrap" as const,
    lineHeight: 1.1,
    fontWeight: 700 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };

  return (
    <div className="min-w-0 flex-1" style={{ lineHeight: "normal" }}>
      <table
        className="w-full border-collapse text-left"
        style={{ tableLayout: "fixed", width: "100%" }}
      >
        <colgroup>
          <col style={{ width: compact ? 52 : 72 }} />
          <col />
          <col style={{ width: compact ? 78 : 96 }} />
          <col style={{ width: compact ? 88 : 104 }} />
          <col style={{ width: compact ? 78 : 96 }} />
          <col style={{ width: compact ? 108 : 128 }} />
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
              Թիմ
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Հաղթ
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Սպան.
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Տեղ
            </th>
            <th
              className="px-2 text-center"
              style={{ ...headTh, fontSize: headFontPx, paddingTop: headPy, paddingBottom: headPy }}
            >
              Միավոր
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
                      ...numberFontBase,
                      fontSize: bodyNumberFontPx,
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
                  className="px-2 text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: bodyNumberFontPx,
                    color: GRAPHIC_OFFICIAL_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.chickenDinners}
                </td>
                <td
                  className="px-2 text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: bodyNumberFontPx,
                    color: GRAPHIC_OFFICIAL_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.totalKills}
                </td>
                <td
                  className="px-2 text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: bodyNumberFontPx,
                    color: GRAPHIC_OFFICIAL_GOLD,
                    ...statCell,
                    paddingTop: rowPadY,
                    paddingBottom: rowPadY,
                  }}
                >
                  {r.totalPlacementPoints}
                </td>
                <td
                  className="px-2 text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: totalFontPx,
                    color: hasStandingsData(r) ? GRAPHIC_OFFICIAL_GOLD : TEXT_DIM,
                    textShadow: hasStandingsData(r)
                      ? `0 0 14px rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.45)`
                      : undefined,
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
  const leftCount = Math.ceil(rows.length / 2);
  const leftRows = rows.slice(0, leftCount);
  const rightRows = rows.slice(leftCount);
  const dense = leftCount > 8;

  return (
    <div
      ref={ref}
      data-graphic-capture
      lang="hy"
      className="relative box-border shrink-0 overflow-hidden font-board antialiased"
      style={{
        width: SPLIT_RESULTS_EXPORT_W,
        fontFeatureSettings: '"tnum" 1',
        lineHeight: "normal",
        color: GRAPHIC_OFFICIAL_GOLD,
        backgroundColor: GRAPHIC_OFFICIAL_BG,
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
          height: PHOTO_H,
          overflow: "hidden",
        }}
      >
        <img
          src={RESULTS_BG_URL}
          alt=""
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 28%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(5, 8, 16, 0.18) 0%, rgba(5, 8, 16, 0.4) 60%, rgb(7, 11, 20) 100%)",
          }}
        />
      </div>

      <div
        className="relative z-10 flex flex-col pb-8 pt-10"
        style={{
          paddingLeft: SIDE_PAD,
          paddingRight: SIDE_PAD,
          boxSizing: "border-box",
        }}
      >
        <header
          className="shrink-0 border-b pb-4"
          style={{
            borderColor: HEADER_BORDER,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: GRAPHIC_OFFICIAL_GOLD,
              }}
            >
              8 · 8 կողք կողքի
            </p>
            <h1
              style={{
                margin: "4px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "0.02em",
                color: GRAPHIC_OFFICIAL_GOLD,
                textShadow: `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.25) 0px 2px 20px`,
              }}
            >
              Վերջնական արդյունքներ
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: FONT_BOARD,
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.2,
                color: GRAPHIC_OFFICIAL_GOLD,
                wordBreak: "break-word",
              }}
            >
              {tournamentName || "Մրցաշար"}
            </p>
          </div>
          <p
            style={{
              margin: 0,
              flexShrink: 0,
              fontFamily: FONT_DISPLAY,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: `rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.9)`,
            }}
          >
            ԽԱՂ {matchCurrent}/{matchTotal}
          </p>
        </header>

        <div className="mt-4">
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
              Այս մրցաշարում թիմեր չկան
            </div>
          ) : (
            <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>
              <SplitColumn
                title={rangeTitle(1, leftRows.length)}
                rows={leftRows}
                dense={dense}
              />
              <div
                aria-hidden
                style={{
                  width: 1,
                  alignSelf: "stretch",
                  background: `linear-gradient(180deg, transparent, rgba(${GRAPHIC_OFFICIAL_GOLD_RGB}, 0.55), transparent)`,
                }}
              />
              <SplitColumn
                title={
                  rightRows.length
                    ? rangeTitle(leftRows.length + 1, rightRows.length)
                    : "—"
                }
                rows={rightRows}
                dense={dense}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FinalResultsGraphicOfficial.displayName = "FinalResultsGraphicOfficial";
