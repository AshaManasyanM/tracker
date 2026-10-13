import { forwardRef, type CSSProperties } from "react";
import { formatStandingRank, type TeamStanding } from "../lib/standings";
import {
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

const NAME_COLOR = "#F6F3EA";
const STAT_COLOR = "rgba(236, 232, 220, 0.72)";
const GOLD = "#E6C15A";
const GOLD_DIM = "rgba(230, 193, 90, 0.5)";
const PAGE_BG = "#070b14";
const TABLE_BG = "rgba(5, 8, 16, 0.58)";
const ROW_LINE = "rgba(255, 255, 255, 0.08)";

const SIDE_PAD = 20;

function placeTone(rank: number): { background: string; rank: string } {
  if (rank === 1) return { background: "rgba(230, 193, 90, 0.18)", rank: "#E6C15A" };
  if (rank === 2) return { background: "rgba(214, 220, 230, 0.14)", rank: "#E4E7EE" };
  if (rank === 3) return { background: "rgba(184, 122, 66, 0.18)", rank: "#E0A36A" };
  return { background: "transparent", rank: GOLD };
}

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rangeTitle(start: number, count: number): string {
  if (count <= 0) return "—";
  const end = start + count - 1;
  return start === end ? String(start) : `${start}–${end}`;
}

function SplitColumn({
  title,
  rows,
}: {
  title: string;
  rows: TeamStanding[];
}) {
  return (
    <div style={{ flex: "1 1 0", minWidth: 0 }}>
      <p
        style={{
          margin: "0 0 8px",
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: GOLD,
        }}
      >
        {title}
      </p>
      <div
        style={{
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "4px 8px 6px",
          background: TABLE_BG,
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
              color: GOLD_DIM,
            }}
          >
            —
          </p>
        ) : (
          <OfficialResultsColumn rows={rows} />
        )}
      </div>
    </div>
  );
}

function OfficialResultsColumn({ rows }: { rows: TeamStanding[] }) {
  const rowPadY = 4;
  const headPy = 7;
  const headFontPx = 13;
  const statFontPx = 22;
  const rankFontPx = 22;
  const totalFontPx = 22;
  const teamLogoPx = 32;
  const teamNamePx = 24;
  const rowHeight = teamLogoPx + rowPadY * 2 + 6;
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
    color: "rgba(246, 243, 234, 0.72)",
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
          <col style={{ width: 40 }} />
          <col />
          <col style={{ width: 58 }} />
          <col style={{ width: 64 }} />
          <col style={{ width: 56 }} />
          <col style={{ width: 68 }} />
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
                style={{ fontFamily: FONT_BOARD, color: GOLD_DIM }}
              >
                —
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const place = r.rank > 0 ? r.rank : i + 1;
              const tone = placeTone(place);
              const played = hasStandingsData(r);
              return (
              <tr
                key={r.team.id}
                style={{
                  height: rowHeight,
                  borderBottom: `1px solid ${ROW_LINE}`,
                  background: tone.background,
                }}
              >
                <td
                  className="text-center"
                  style={{ ...cellMiddle, padding: `${rowPadY}px 2px` }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      ...numberFontBase,
                      fontSize: rankFontPx,
                      color: played ? tone.rank : GOLD_DIM,
                    }}
                  >
                    {formatStandingRank(r)}
                  </span>
                </td>
                <td
                  className="text-left"
                  style={{
                    ...cellMiddle,
                    padding: `${rowPadY}px 4px`,
                    overflow: "hidden",
                    maxWidth: 0,
                  }}
                >
                  <GraphicTeamRow
                    team={r.team}
                    align="left"
                    logoPx={teamLogoPx}
                    nameFontSize={teamNamePx}
                    nameFontWeight={700}
                    nameColor={NAME_COLOR}
                    gapPx={8}
                  />
                </td>
                <td
                  className="text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: statFontPx,
                    color: STAT_COLOR,
                    ...statCell,
                    padding: `${rowPadY}px 2px`,
                  }}
                >
                  {r.chickenDinners}
                </td>
                <td
                  className="text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: statFontPx,
                    color: STAT_COLOR,
                    ...statCell,
                    padding: `${rowPadY}px 2px`,
                  }}
                >
                  {r.totalKills}
                </td>
                <td
                  className="text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: statFontPx,
                    color: STAT_COLOR,
                    ...statCell,
                    padding: `${rowPadY}px 2px`,
                  }}
                >
                  {r.totalPlacementPoints}
                </td>
                <td
                  className="text-center"
                  style={{
                    ...numberFontBase,
                    fontSize: totalFontPx,
                    color: played ? GOLD : GOLD_DIM,
                    ...statCell,
                    padding: `${rowPadY}px 2px`,
                  }}
                >
                  {r.totalPoints}
                </td>
              </tr>
              );
            })
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
  const leftRows = rows.slice(0, 8);
  const rightRows = rows.slice(8);

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
        color: NAME_COLOR,
        backgroundColor: PAGE_BG,
        fontFamily: FONT_BOARD,
      }}
    >
      <img
        src={RESULTS_BG_URL}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(5, 8, 16, 0.68)",
        }}
      />

      <div
        className="relative z-10 flex flex-col"
        style={{
          padding: "14px 20px 12px",
          paddingLeft: SIDE_PAD,
          paddingRight: SIDE_PAD,
          boxSizing: "border-box",
        }}
      >
        <header
          className="shrink-0"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            paddingBottom: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: GOLD,
              }}
            >
              8 · 8 կողք կողքի
            </p>
            <h1
              style={{
                margin: "2px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.05,
                color: NAME_COLOR,
              }}
            >
              Վերջնական արդյունքներ
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              flexShrink: 0,
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 600,
              color: GOLD,
              textAlign: "right",
            }}
          >
            ԽԱՂ {matchCurrent}/{matchTotal}
            <span style={{ display: "block", color: "rgba(246, 243, 234, 0.85)", fontWeight: 600 }}>
              {tournamentName || "Մրցաշար"}
            </span>
          </p>
        </header>

        <div style={{ marginTop: 6 }}>
          {rows.length === 0 ? (
            <div
              style={{
                padding: "36px 0",
                textAlign: "center",
                fontFamily: FONT_DISPLAY,
                fontSize: 18,
                color: GOLD_DIM,
              }}
            >
              Այս մրցաշարում թիմեր չկան
            </div>
          ) : (
            <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              <SplitColumn title={rangeTitle(1, leftRows.length)} rows={leftRows} />
              <SplitColumn
                title={rightRows.length ? rangeTitle(9, rightRows.length) : "9–16"}
                rows={rightRows}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FinalResultsGraphicOfficial.displayName = "FinalResultsGraphicOfficial";
