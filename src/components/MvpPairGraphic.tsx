import { forwardRef } from "react";
import type { PlayerGender, Team } from "../types/tournament";
import { genderLabel, mvpTitleForGender } from "../lib/playerGender";
import { GraphicTeamRow } from "./GraphicTeamRow";
import { MVP_EXPORT_H, MVP_EXPORT_W } from "./MvpGraphic";

export type MvpPairEntry = {
  mvpGender: PlayerGender;
  playerName: string;
  team: Team;
  totalKills: number;
  matchesPlayed: number;
};

export type MvpPairGraphicProps = {
  tournamentName: string;
  boy: MvpPairEntry | null;
  girl: MvpPairEntry | null;
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";
const BG = "#070b14";
const GOLD = "#E6C15A";
const GOLD_RGB = "230, 193, 90";
const HALF_W = MVP_EXPORT_W / 2;
const HEADER_H = 168;
const BODY_H = MVP_EXPORT_H - HEADER_H;

function MvpColumn({ entry }: { entry: MvpPairEntry }) {
  const title = mvpTitleForGender(entry.mvpGender);
  return (
    <div
      style={{
        width: HALF_W,
        height: BODY_H,
        boxSizing: "border-box",
        padding: "32px 48px 40px",
        textAlign: "center",
        backgroundColor: BG,
        verticalAlign: "top",
      }}
    >
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: GOLD,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 20,
          fontFamily: FONT_BOARD,
          fontSize: 56,
          fontWeight: 700,
          color: "#f8fafc",
          lineHeight: 1.1,
          wordBreak: "break-word",
        }}
      >
        {entry.playerName}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: FONT_DISPLAY,
          fontSize: 22,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: `rgba(${GOLD_RGB}, 0.55)`,
          lineHeight: 1.2,
        }}
      >
        {genderLabel(entry.mvpGender)} MVP
      </div>
      <div style={{ marginTop: 36 }}>
        <GraphicTeamRow team={entry.team} />
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 36,
          padding: "16px 40px",
          borderRadius: 12,
          border: `2px solid rgba(${GOLD_RGB}, 0.35)`,
          backgroundColor: `rgba(${GOLD_RGB}, 0.08)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 64,
            fontWeight: 700,
            color: GOLD,
            fontFeatureSettings: '"tnum" 1',
            lineHeight: 1,
          }}
        >
          {entry.totalKills}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 20,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: `rgba(${GOLD_RGB}, 0.6)`,
            lineHeight: 1.2,
          }}
        >
          elims
        </div>
      </div>
    </div>
  );
}

function EmptyColumn({ gender }: { gender: PlayerGender }) {
  return (
    <div
      style={{
        width: HALF_W,
        height: BODY_H,
        boxSizing: "border-box",
        padding: "32px 48px",
        textAlign: "center",
        fontFamily: FONT_BOARD,
        fontSize: 28,
        color: `rgba(${GOLD_RGB}, 0.35)`,
        backgroundColor: BG,
        paddingTop: Math.round(BODY_H * 0.42),
      }}
    >
      No {genderLabel(gender)} MVP
    </div>
  );
}

export const MvpPairGraphic = forwardRef<HTMLDivElement, MvpPairGraphicProps>(
  function MvpPairGraphic({ tournamentName, boy, girl }, ref) {
    return (
      <div
        ref={ref}
        data-graphic-capture
        style={{
          width: MVP_EXPORT_W,
          height: MVP_EXPORT_H,
          lineHeight: "normal",
          fontFamily: FONT_BOARD,
          backgroundColor: BG,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: HEADER_H,
            boxSizing: "border-box",
            padding: "40px 48px 28px",
            textAlign: "center",
            borderBottom: `1px solid rgba(${GOLD_RGB}, 0.25)`,
            backgroundColor: "#0a101c",
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: `rgba(${GOLD_RGB}, 0.75)`,
              lineHeight: 1.1,
            }}
          >
            {tournamentName}
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_DISPLAY,
              fontSize: 28,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(220, 228, 240, 0.7)",
              lineHeight: 1.1,
            }}
          >
            Boy & Girl MVP
          </div>
        </div>

        <div
          data-export-columns
          style={{
            display: "table",
            width: MVP_EXPORT_W,
            height: BODY_H,
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <div style={{ display: "table-row", height: BODY_H }}>
            <div style={{ display: "table-cell", width: HALF_W, verticalAlign: "top" }}>
              {boy ? <MvpColumn entry={boy} /> : <EmptyColumn gender="boy" />}
            </div>
            <div
              style={{
                display: "table-cell",
                width: 3,
                backgroundColor: `rgba(${GOLD_RGB}, 0.45)`,
              }}
              aria-hidden
            />
            <div style={{ display: "table-cell", width: HALF_W, verticalAlign: "top" }}>
              {girl ? <MvpColumn entry={girl} /> : <EmptyColumn gender="girl" />}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
