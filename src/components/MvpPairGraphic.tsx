import { forwardRef } from "react";
import type { PlayerGender, Team } from "../types/tournament";
import { genderLabel, mvpTitleForGender } from "../lib/playerGender";
import { TeamAvatar } from "./TeamAvatar";
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

function TeamRow({ team }: { team: Team }) {
  return (
    <div
      style={{
        display: "table",
        margin: "0 auto",
        tableLayout: "auto",
      }}
    >
      <div style={{ display: "table-row" }}>
        <div
          style={{
            display: "table-cell",
            verticalAlign: "middle",
            paddingRight: 24,
            lineHeight: 0,
          }}
        >
          <TeamAvatar team={team} size="2xl" priority />
        </div>
        <div
          style={{
            display: "table-cell",
            verticalAlign: "middle",
            fontFamily: FONT_BOARD,
            fontSize: 40,
            fontWeight: 600,
            color: GOLD,
            lineHeight: 1.15,
            maxWidth: 400,
            wordBreak: "break-word",
          }}
        >
          {team.name}
        </div>
      </div>
    </div>
  );
}

function MvpColumn({ entry }: { entry: MvpPairEntry }) {
  const title = mvpTitleForGender(entry.mvpGender);
  return (
    <div
      style={{
        width: HALF_W,
        height: "100%",
        boxSizing: "border-box",
        padding: "32px 48px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: `radial-gradient(ellipse 75% 60% at 50% 40%, rgba(${GOLD_RGB}, 0.12) 0%, ${BG} 65%)`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: GOLD,
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: "20px 0 0",
          fontFamily: FONT_BOARD,
          fontSize: 56,
          fontWeight: 700,
          color: "#f8fafc",
          lineHeight: 1.1,
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {entry.playerName}
      </p>
      <p
        style={{
          margin: "12px 0 0",
          fontFamily: FONT_DISPLAY,
          fontSize: 22,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: `rgba(${GOLD_RGB}, 0.55)`,
        }}
      >
        {genderLabel(entry.mvpGender)} MVP
      </p>
      <div style={{ marginTop: 36, width: "100%" }}>
        <TeamRow team={entry.team} />
      </div>
      <div
        style={{
          marginTop: 36,
          padding: "16px 40px",
          borderRadius: 12,
          border: `2px solid rgba(${GOLD_RGB}, 0.35)`,
          background: `rgba(${GOLD_RGB}, 0.08)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: 64,
            fontWeight: 700,
            color: GOLD,
            fontFeatureSettings: '"tnum" 1',
            lineHeight: 1,
          }}
        >
          {entry.totalKills}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 20,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: `rgba(${GOLD_RGB}, 0.6)`,
          }}
        >
          elims
        </p>
      </div>
    </div>
  );
}

function EmptyColumn({ gender }: { gender: PlayerGender }) {
  return (
    <div
      style={{
        width: HALF_W,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_BOARD,
        fontSize: 28,
        color: `rgba(${GOLD_RGB}, 0.35)`,
        background: BG,
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
        style={{
          width: MVP_EXPORT_W,
          height: MVP_EXPORT_H,
          lineHeight: "normal",
          fontFamily: FONT_BOARD,
          background: BG,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            padding: "40px 48px 28px",
            textAlign: "center",
            borderBottom: `1px solid rgba(${GOLD_RGB}, 0.25)`,
            background: `linear-gradient(180deg, rgba(${GOLD_RGB}, 0.08) 0%, ${BG} 100%)`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: `rgba(${GOLD_RGB}, 0.75)`,
            }}
          >
            {tournamentName}
          </p>
          <p
            style={{
              margin: "14px 0 0",
              fontFamily: FONT_DISPLAY,
              fontSize: 28,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(220, 228, 240, 0.7)",
            }}
          >
            Boy & Girl MVP
          </p>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            minHeight: 0,
          }}
        >
          {boy ? <MvpColumn entry={boy} /> : <EmptyColumn gender="boy" />}
          <div
            style={{
              width: 3,
              flexShrink: 0,
              background: `linear-gradient(180deg, transparent 0%, rgba(${GOLD_RGB}, 0.5) 20%, rgba(${GOLD_RGB}, 0.5) 80%, transparent 100%)`,
            }}
            aria-hidden
          />
          {girl ? <MvpColumn entry={girl} /> : <EmptyColumn gender="girl" />}
        </div>
      </div>
    );
  },
);
