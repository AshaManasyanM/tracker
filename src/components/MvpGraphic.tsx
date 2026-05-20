import { forwardRef } from "react";
import type { PlayerGender, Team } from "../types/tournament";
import { mvpTitleForGender } from "../lib/playerGender";
import { TeamAvatar } from "./TeamAvatar";

export type MvpGraphicProps = {
  tournamentName: string;
  mvpGender: PlayerGender;
  playerName: string;
  team: Team;
  totalKills: number;
  matchesPlayed: number;
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";
const BG = "#070b14";
const GOLD = "#E6C15A";
const GOLD_RGB = "230, 193, 90";

export const MVP_EXPORT_W = 1920;
export const MVP_EXPORT_H = 1080;

export const MvpGraphic = forwardRef<HTMLDivElement, MvpGraphicProps>(function MvpGraphic(
  { tournamentName, mvpGender, playerName, team, totalKills, matchesPlayed },
  ref,
) {
  const mvpTitle = mvpTitleForGender(mvpGender);
  return (
    <div
      ref={ref}
      style={{
        width: MVP_EXPORT_W,
        height: MVP_EXPORT_H,
        lineHeight: "normal",
        fontFamily: FONT_BOARD,
        background: `radial-gradient(ellipse 80% 60% at 50% 35%, rgba(${GOLD_RGB}, 0.14) 0%, ${BG} 55%, ${BG} 100%)`,
        color: "#e8ecf4",
        boxSizing: "border-box",
        padding: 72,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: `rgba(${GOLD_RGB}, 0.55)`,
        }}
      >
        {tournamentName}
      </p>

      <p
        style={{
          margin: "28px 0 0",
          fontFamily: FONT_DISPLAY,
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: GOLD,
          textShadow: `0 0 48px rgba(${GOLD_RGB}, 0.45)`,
        }}
      >
        {mvpTitle}
      </p>

      <p
        style={{
          margin: "20px 0 0",
          fontSize: 88,
          fontWeight: 700,
          color: "#f4f6fa",
          textAlign: "center",
          maxWidth: "90%",
          wordBreak: "break-word",
        }}
      >
        {playerName}
      </p>

      <div
        style={{
          marginTop: 48,
          display: "table",
          tableLayout: "auto",
          borderCollapse: "collapse",
        }}
      >
        <div style={{ display: "table-row" }}>
          <div
            style={{
              display: "table-cell",
              verticalAlign: "middle",
              paddingRight: 40,
              lineHeight: 0,
            }}
          >
            <TeamAvatar team={team} size="2xl" priority />
          </div>
          <div
            style={{
              display: "table-cell",
              verticalAlign: "middle",
              fontSize: 48,
              fontWeight: 600,
              color: GOLD,
              letterSpacing: "0.02em",
            }}
          >
            {team.name}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 56,
          padding: "28px 56px",
          borderRadius: 16,
          border: `2px solid rgba(${GOLD_RGB}, 0.35)`,
          background: `linear-gradient(180deg, rgba(${GOLD_RGB}, 0.12) 0%, rgba(${GOLD_RGB}, 0.04) 100%)`,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: 28,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: `rgba(${GOLD_RGB}, 0.7)`,
          }}
        >
          Total elims
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontFamily: FONT_DISPLAY,
            fontSize: 96,
            fontWeight: 700,
            color: GOLD,
            fontFeatureSettings: '"tnum" 1',
          }}
        >
          {totalKills}
        </p>
        {matchesPlayed > 0 && (
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 28,
              color: `rgba(${GOLD_RGB}, 0.45)`,
            }}
          >
            across {matchesPlayed} match{matchesPlayed === 1 ? "" : "es"}
          </p>
        )}
      </div>
    </div>
  );
});
