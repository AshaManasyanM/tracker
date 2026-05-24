import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { TeamStanding } from "../lib/standings";
import {
  ALPHA7_LOGO_URL,
  GRAPHIC_GOLD_RGB,
  GRAPHIC_TEXT,
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

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";

const TOTAL_GOLD = "#FFF3C4";
const PAGE_BG = "#03050a";
const TABLE_BG = "rgba(5, 8, 16, 0.86)";

const PORTRAIT = RESULTS_EXPORT_W <= 1080;
const TABLE_WATERMARK_OPACITY = 0.09;
const SIDE_PAD = PORTRAIT ? 28 : 40;
const FOOTER_TEXT = "ALPHA SEVEN • FINAL STAGE • OVERALL STANDINGS";

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
  const noiseSvg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/></filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="0.35"/>
    </svg>`,
  );
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,${noiseSvg}")`,
          backgroundSize: "180px 180px",
          opacity: 0.08,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          backgroundImage: `repeating-linear-gradient(
            125deg,
            transparent,
            transparent 48px,
            rgba(255, 255, 255, 0.008) 48px,
            rgba(255, 255, 255, 0.008) 49px
          )`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: PAGE_BG,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/** Brand mark fills the standings table area — PMSL/PMGC-style broadcast depth. */
function TableBrandWatermark() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <img
        src={ALPHA7_LOGO_URL}
        alt=""
        loading="eager"
        decoding="sync"
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
          opacity: TABLE_WATERMARK_OPACITY,
          filter: "sepia(0.25) saturate(0.85) brightness(1.15)",
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
  const rowPadY = dense ? 5 : 6;
  const headPy = dense ? 12 : 14;
  const headFontPx = dense ? 12 : 13;
  const bodyNumberFontPx = 26;
  const totalFontPx = dense ? 19 : 22;
  const teamLogoPx = dense ? 52 : 58;
  const teamNamePx = dense ? 18 : 20;
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
    letterSpacing: "0.16em",
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
        <col style={{ width: 58 }} />
        <col style={{ width: 52 }} />
        <col style={{ width: 58 }} />
        <col style={{ width: 60 }} />
        <col style={{ width: 88 }} />
      </colgroup>
      <thead>
        <tr
          style={{
            background: HEAD_GRADIENT,
            boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          {(["#", "Team", "WWCD", "MP", "ELIMS", "PLACE", "TOTAL"] as const).map((label) => {
            const isTotal = label === "TOTAL";
            const isTeam = label === "Team";
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
                  letterSpacing: isTotal ? "0.2em" : headTh.letterSpacing,
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
      standingsSubtitle = "OVERALL STANDINGS",
    },
    ref,
  ) {
    const dense = rows.length > 16;

    return (
      <div
        ref={ref}
        data-graphic-capture
        lang="en"
        className="relative shrink-0 overflow-visible font-board antialiased"
        style={{
          width: RESULTS_EXPORT_W,
          color: GRAPHIC_TEXT,
          backgroundColor: PAGE_BG,
          fontFamily: FONT_BOARD,
          lineHeight: "normal",
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
              background: "linear-gradient(180deg, #080a0f 0%, #0a0c12 100%)",
              borderBottom: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.12)`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 13 : 15,
                fontWeight: 700,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: `rgba(${GRAPHIC_GOLD_RGB}, 0.88)`,
              }}
            >
              {standingsSubtitle}
            </p>
            <h1
              style={{
                margin: "8px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 44 : 56,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#FFF4D6",
                textShadow: `0 2px 24px rgba(${GRAPHIC_GOLD_RGB}, 0.45), 0 0 48px rgba(${GRAPHIC_GOLD_RGB}, 0.2)`,
              }}
            >
              Final stage
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: PORTRAIT ? 15 : 18,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: `rgba(${GRAPHIC_GOLD_RGB}, 0.82)`,
              }}
            >
              MATCH {matchCurrent}/{matchTotal}
            </p>
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: FONT_BOARD,
                fontSize: PORTRAIT ? 22 : 26,
                fontWeight: 700,
                color: "rgba(240, 244, 252, 0.95)",
                wordBreak: "break-word",
              }}
            >
              {tournamentName || "Tournament"}
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
              <TableBrandWatermark />
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
                    No teams in this tournament
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
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
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
