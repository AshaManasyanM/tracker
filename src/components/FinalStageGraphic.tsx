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
  /** Big title. Group tables use the group name; finals keep the default. */
  heading?: string;
};

const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";

const NAME_COLOR = "#FFFFFF";
const STAT_COLOR = "rgba(255, 255, 255, 0.82)";
const GOLD = "#F5B82E";
const GOLD_DIM = "rgba(245, 184, 46, 0.55)";
const PAGE_BG = "#140c06";
const TABLE_BG = "rgba(22, 13, 6, 0.42)";
const ROW_LINE = "rgba(255, 255, 255, 0.08)";

const PORTRAIT = RESULTS_EXPORT_W <= 1080;
const SIDE_PAD = 14;
/** Same gold gradient as the group-draw posters ("GROUP B" title). */
const GOLD_GRADIENT = "linear-gradient(180deg, #FFE08A 0%, #F5B82E 55%, #D98A0B 100%)";
const GOLD_TEXT: CSSProperties = {
  color: GOLD,
  backgroundImage: GOLD_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const DEFAULT_HEADING = "Եզրափակիչ փուլ";

function placeTone(rank: number): { background: string; rank: string } {
  if (rank === 1) return { background: "rgba(245, 184, 46, 0.16)", rank: "#FFC94A" };
  if (rank === 2) return { background: "rgba(214, 220, 230, 0.09)", rank: "#E4E7EE" };
  if (rank === 3) return { background: "rgba(184, 122, 66, 0.12)", rank: "#E0A36A" };
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
          // Oversize slightly so the blur doesn't show soft edges.
          inset: -8,
          width: "calc(100% + 16px)",
          height: "calc(100% + 16px)",
          objectFit: "cover",
          objectPosition: "center 30%",
          filter: "blur(2px)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 45%, rgba(24, 12, 4, 0.08) 0%, rgba(24, 12, 4, 0.42) 100%)",
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
    color: `rgba(255, 255, 255, 0.92)`,
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
                ...(played && (place === 1 || place > 3) ? GOLD_TEXT : {}),
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
          <span style={played ? GOLD_TEXT : undefined}>{r.totalPoints}</span>
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
                  color: isTotal ? GOLD : "rgba(255, 255, 255, 0.75)",
                  ...(isTotal ? GOLD_TEXT : {}),
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
      heading = DEFAULT_HEADING,
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
                ...GOLD_TEXT,
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
                ...GOLD_TEXT,
              }}
            >
              {heading}
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
              <span style={GOLD_TEXT}>
                ԽԱՂ {matchCurrent}/{matchTotal}
              </span>
              <span style={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 600 }}>
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
                border: "1px solid rgba(255, 255, 255, 0.14)",
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
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            {heading} • Ընդհանուր աղյուսակ
          </p>
        </div>
      </div>
    );
  },
);

FinalStageGraphic.displayName = "FinalStageGraphic";
