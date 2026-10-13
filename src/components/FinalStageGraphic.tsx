import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { TeamStanding } from "../lib/standings";
import {
  GRAPHIC_GOLD_RGB,
  GRAPHIC_TEXT,
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

const TOTAL_GOLD = "#FFF3C4";
const PAGE_BG = "#03050a";
const TABLE_BG = "rgba(5, 8, 16, 0.94)";

const PORTRAIT = RESULTS_EXPORT_W <= 1080;
const PHOTO_H = 300;
const SIDE_PAD = PORTRAIT ? 28 : 40;
const FOOTER_TEXT = "Եզրափակիչ փուլ • Ընդհանուր աղյուսակ";

const HEAD_GRADIENT =
  "linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)";
const ROW_STRIPE_A = "rgba(255, 255, 255, 0.025)";
const ROW_STRIPE_B = "rgba(255, 255, 255, 0.05)";

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function rankNumberColor(played: boolean): string {
  return played ? `rgba(${GRAPHIC_GOLD_RGB}, 0.92)` : `rgba(${GRAPHIC_GOLD_RGB}, 0.55)`;
}

function rowBackground(_s: TeamStanding, index: number): CSSProperties {
  return {
    backgroundColor: index % 2 === 0 ? ROW_STRIPE_A : ROW_STRIPE_B,
  };
}

function BroadcastBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: PHOTO_H,
        overflow: "hidden",
        pointerEvents: "none",
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
            "linear-gradient(180deg, rgba(5, 8, 16, 0.2) 0%, rgba(5, 8, 16, 0.35) 55%, #03050a 100%)",
        }}
      />
    </div>
  );
}

function StandingsTable({
  rows,
  dense,
}: {
  rows: TeamStanding[];
  dense: boolean;
}) {
  const rowPadY = dense ? 6 : 8;
  const headPy = dense ? 14 : 16;
  const headFontPx = dense ? 16 : 18;
  const bodyNumberFontPx = dense ? 28 : 32;
  const totalFontPx = dense ? 26 : 30;
  const teamLogoPx = dense ? 44 : 48;
  const teamNamePx = dense ? 22 : 26;
  const rankColW = 66;
  const rankCellPadRight = 22;
  const teamCellPadLeft = 12;
  const logoToNameGapPx = dense ? 16 : 18;
  const statPadX = dense ? 12 : 14;
  const totalPadX = dense ? 12 : 14;
  const rowHeight = Math.max(dense ? 48 : 52, teamLogoPx + rowPadY * 2 + 4);

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

    bodyRows.push(
      <tr
        key={r.team.id}
        style={{
          height: rowHeight,
          borderBottom: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.14)`,
          ...rowBackground(r, i),
        }}
      >
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${rankCellPadRight}px ${rowPadY}px 6px`,
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
                fontSize: bodyNumberFontPx,
                color: rankNumberColor(played),
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
            gapPx={logoToNameGapPx}
          />
        </td>
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${statPadX}px`,
            ...numberFontBase,
            fontSize: bodyNumberFontPx,
            color: `rgba(${GRAPHIC_GOLD_RGB}, 0.92)`,
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
            fontSize: bodyNumberFontPx,
            color: `rgba(${GRAPHIC_GOLD_RGB}, 0.88)`,
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
            fontSize: bodyNumberFontPx,
            color: `rgba(${GRAPHIC_GOLD_RGB}, 0.92)`,
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
            fontSize: bodyNumberFontPx,
            color: `rgba(${GRAPHIC_GOLD_RGB}, 0.85)`,
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
            color: played ? TOTAL_GOLD : `rgba(${GRAPHIC_GOLD_RGB}, 0.42)`,
            textShadow: played
              ? `0 0 14px rgba(${GRAPHIC_GOLD_RGB}, 0.55)`
              : undefined,
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
        <col style={{ width: 88 }} />
        <col style={{ width: 72 }} />
        <col style={{ width: 100 }} />
        <col style={{ width: 84 }} />
        <col style={{ width: 132 }} />
      </colgroup>
      <thead>
        <tr
          style={{
            background: HEAD_GRADIENT,
            boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
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
                  borderBottom: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.22)`,
                  color: isTotal ? TOTAL_GOLD : headTh.color,
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
    const dense = rows.length > 16;

    return (
      <div
        ref={ref}
        data-graphic-capture
        lang="hy"
        className="relative shrink-0 overflow-hidden font-board antialiased"
        style={{
          width: RESULTS_EXPORT_W,
          color: GRAPHIC_TEXT,
          backgroundColor: PAGE_BG,
          fontFamily: FONT_BOARD,
          lineHeight: "normal",
          boxShadow: `inset 0 0 0 3px rgba(${GRAPHIC_GOLD_RGB}, 0.55)`,
        }}
      >
        <BroadcastBackground />

        <div
          className="relative z-10 flex flex-col pb-8 pt-6"
          style={{
            paddingLeft: SIDE_PAD,
            paddingRight: SIDE_PAD,
            boxSizing: "border-box",
          }}
        >
          <header
            className="shrink-0 text-center"
            style={{
              marginLeft: -SIDE_PAD,
              marginRight: -SIDE_PAD,
              marginTop: -24,
              paddingTop: 24,
              paddingBottom: 20,
              paddingLeft: SIDE_PAD,
              paddingRight: SIDE_PAD,
              background: "transparent",
              borderBottom: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.12)`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 18 : 20,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: `rgba(${GRAPHIC_GOLD_RGB}, 0.88)`,
              }}
            >
              {standingsSubtitle}
            </p>
            <h1
              style={{
                margin: "14px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 58 : 68,
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "0.02em",
                color: "#FFF4D6",
                textShadow: `0 2px 24px rgba(${GRAPHIC_GOLD_RGB}, 0.45), 0 0 48px rgba(${GRAPHIC_GOLD_RGB}, 0.2)`,
              }}
            >
              Եզրափակիչ փուլ
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 24 : 28,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: `rgba(${GRAPHIC_GOLD_RGB}, 0.82)`,
              }}
            >
              ԽԱՂ {matchCurrent}/{matchTotal}
            </p>
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: FONT_BOARD,
                fontSize: PORTRAIT ? 30 : 34,
                fontWeight: 700,
                color: "rgba(240, 244, 252, 0.95)",
                wordBreak: "break-word",
              }}
            >
              {tournamentName || "Մրցաշար"}
            </p>
          </header>

          <div className="relative mt-4">
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "-12px -6px",
                borderRadius: 12,
                background:
                  "radial-gradient(ellipse 85% 60% at 50% 40%, rgba(255,255,255,0.02), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 8,
                border: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.22)`,
                backgroundColor: TABLE_BG,
                boxShadow: `
                  0 20px 50px rgba(0, 0, 0, 0.7),
                  inset 0 1px 0 rgba(${GRAPHIC_GOLD_RGB}, 0.08),
                  inset 0 0 80px rgba(0, 0, 0, 0.35)
                `,
                padding: PORTRAIT ? "10px 8px 12px" : "12px 10px 14px",
              }}
            >
              <div style={{ position: "relative", zIndex: 1 }}>
                {rows.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      padding: "40px 0",
                      textAlign: "center",
                      fontFamily: FONT_DISPLAY,
                      fontSize: 20,
                      color: `rgba(${GRAPHIC_GOLD_RGB}, 0.4)`,
                    }}
                  >
                    Այս մրցաշարում թիմեր չկան
                  </p>
                ) : (
                  <StandingsTable rows={rows} dense={dense} />
                )}
              </div>
            </div>
          </div>

          <p
            style={{
              margin: "20px 0 0",
              textAlign: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: `rgba(${GRAPHIC_GOLD_RGB}, 0.34)`,
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
