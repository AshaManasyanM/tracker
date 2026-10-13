import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { TeamStanding } from "../lib/standings";
import {
  RESULTS_BG_URL,
  RESULTS_EXPORT_W,
} from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FinalStageGraphicProps = {
  tournamentName: string;
  rows: TeamStanding[];
  matchCurrent: number;
  matchTotal: number;
  standingsSubtitle?: string;
};

const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";

const NAME_COLOR = "#F6F3EA";
const STAT_COLOR = "rgba(236, 232, 220, 0.72)";
const GOLD = "#E6C15A";
const GOLD_DIM = "rgba(230, 193, 90, 0.55)";
const PAGE_BG = "#070b14";
const TABLE_BG = "rgba(5, 8, 16, 0.58)";
const ROW_LINE = "rgba(255, 255, 255, 0.08)";

const PORTRAIT = RESULTS_EXPORT_W <= 1080;
const SIDE_PAD = 18;
const FOOTER_TEXT = "Եզրափակիչ փուլ • Ընդհանուր աղյուսակ";

function placeTone(rank: number): { background: string; rank: string } {
  if (rank === 1) return { background: "rgba(230, 193, 90, 0.18)", rank: "#E6C15A" };
  if (rank === 2) return { background: "rgba(214, 220, 230, 0.14)", rank: "#E4E7EE" };
  if (rank === 3) return { background: "rgba(184, 122, 66, 0.18)", rank: "#E0A36A" };
  return { background: "transparent", rank: GOLD };
}

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rankNumberColor(rank: number, played: boolean): string {
  if (!played) return GOLD_DIM;
  return placeTone(rank).rank;
}

function BroadcastBackground() {
  return (
    <>
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
    </>
  );
}

function StandingsTable({ rows }: { rows: TeamStanding[] }) {
  const rowPadY = 4;
  const headPy = 8;
  const headFontPx = 14;
  const statFontPx = 22;
  const rankFontPx = 24;
  const totalFontPx = 24;
  const teamLogoPx = 32;
  const teamNamePx = 24;
  const rankColW = 46;
  const teamCellPadLeft = 8;
  const logoToNameGapPx = 10;
  const statPadX = 4;
  const totalPadX = 6;
  const rowHeight = teamLogoPx + rowPadY * 2 + 6;

  const numberFontBase: CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 500,
    letterSpacing: "0.02em",
    lineHeight: 1,
  };

  const headTh: CSSProperties = {
    fontFamily: FONT_DISPLAY,
    color: `rgba(255, 248, 230, 0.92)`,
    background: "transparent",
    whiteSpace: "nowrap",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  const bodyRows: ReactNode[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const played = hasStandingsData(r);
    const place = r.rank > 0 ? r.rank : i + 1;
    const tone = placeTone(place);

    bodyRows.push(
      <tr
        key={r.team.id}
        style={{
          height: rowHeight,
          borderBottom: `1px solid ${ROW_LINE}`,
          backgroundColor: tone.background,
        }}
      >
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px 4px`,
            height: rowHeight,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: rowHeight - rowPadY * 2,
            }}
          >
            <span
              style={{
                ...numberFontBase,
                fontSize: rankFontPx,
                color: rankNumberColor(place, played),
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {r.rank > 0 ? r.rank : i + 1}
            </span>
          </div>
        </td>
        <td
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px 6px ${rowPadY}px ${teamCellPadLeft}px`,
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
            gapPx={logoToNameGapPx}
          />
        </td>
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${statPadX}px`,
            ...numberFontBase,
            fontSize: statFontPx,
            color: STAT_COLOR,
          }}
        >
          {r.chickenDinners}
        </td>
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${statPadX}px`,
            ...numberFontBase,
            fontSize: statFontPx,
            color: STAT_COLOR,
          }}
        >
          {r.matchesPlayed}
        </td>
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${statPadX}px`,
            ...numberFontBase,
            fontSize: statFontPx,
            color: STAT_COLOR,
          }}
        >
          {r.totalKills}
        </td>
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${statPadX}px`,
            ...numberFontBase,
            fontSize: statFontPx,
            color: STAT_COLOR,
          }}
        >
          {r.totalPlacementPoints}
        </td>
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${totalPadX}px ${rowPadY}px ${totalPadX + 4}px`,
            ...numberFontBase,
            fontSize: totalFontPx,
            color: played ? GOLD : GOLD_DIM,
          }}
        >
          {r.totalPoints}
        </td>
      </tr>,
    );
  }

  return (
    <table className="w-full border-collapse" style={{ tableLayout: "fixed", width: "100%" }}>
      <colgroup>
        <col style={{ width: rankColW }} />
        <col />
        <col style={{ width: 56 }} />
        <col style={{ width: 48 }} />
        <col style={{ width: 62 }} />
        <col style={{ width: 52 }} />
        <col style={{ width: 72 }} />
      </colgroup>
      <thead>
        <tr
          style={{
            background: "transparent",
            boxShadow: `inset 0 -1px 0 ${ROW_LINE}`,
          }}
        >
          {(["#", "Թիմ", "Հաղթ", "Խաղ", "Սպան.", "Տեղ", "Միավոր"] as const).map((label) => {
            const isTotal = label === "Միավոր";
            const isTeam = label === "Թիմ";
            return (
              <th
                key={label}
                className={isTeam ? "text-left" : "text-center"}
                style={{
                  ...headTh,
                  fontSize: isTotal ? headFontPx : headFontPx,
                  padding: `${headPy}px ${isTeam ? 8 : isTotal ? totalPadX : statPadX}px`,
                  borderBottom: `1px solid ${ROW_LINE}`,
                  color: isTotal ? GOLD : "rgba(246, 243, 234, 0.72)",
                  letterSpacing: headTh.letterSpacing,
                }}
              >
                {label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>{bodyRows}</tbody>
    </table>
  );
}

export const FinalStageGraphic = forwardRef<HTMLDivElement, FinalStageGraphicProps>(
  function FinalStageGraphic(
    {
      tournamentName,
      rows,
      matchCurrent,
      matchTotal,
      standingsSubtitle = "Ընդհանուր աղյուսակ",
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        data-graphic-capture
        lang="hy"
        className="relative shrink-0 overflow-hidden font-board antialiased"
        style={{
          width: RESULTS_EXPORT_W,
          color: NAME_COLOR,
          backgroundColor: PAGE_BG,
          fontFamily: FONT_BOARD,
          lineHeight: "normal",
        }}
      >
        <BroadcastBackground />

        <div
          className="relative z-10 flex flex-col"
          style={{
            padding: "14px 18px 12px",
            paddingLeft: SIDE_PAD,
            paddingRight: SIDE_PAD,
            boxSizing: "border-box",
          }}
        >
          <header className="shrink-0 text-center" style={{ paddingBottom: 8 }}>
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
              {standingsSubtitle}
            </p>
            <h1
              style={{
                margin: "2px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 32 : 36,
                fontWeight: 700,
                lineHeight: 1.05,
                color: NAME_COLOR,
              }}
            >
              Եզրափակիչ փուլ
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: 15,
                fontWeight: 600,
                color: GOLD,
              }}
            >
              ԽԱՂ {matchCurrent}/{matchTotal}
              <span style={{ color: "rgba(246, 243, 234, 0.8)", fontWeight: 600 }}>
                {"  ·  "}
                {tournamentName || "Մրցաշար"}
              </span>
            </p>
          </header>

          <div style={{ marginTop: 8 }}>
            <div
              style={{
                overflow: "hidden",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: TABLE_BG,
                padding: "4px 6px 6px",
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
                  Այս մրցաշարում թիմեր չկան
                </p>
              ) : (
                <StandingsTable rows={rows} />
              )}
            </div>
          </div>

          <p
            style={{
              margin: "8px 0 0",
              textAlign: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(246, 243, 234, 0.55)",
            }}
          >
            {FOOTER_TEXT}
          </p>
        </div>
      </div>
    );
  },
);

FinalStageGraphic.displayName = "FinalStageGraphic";
