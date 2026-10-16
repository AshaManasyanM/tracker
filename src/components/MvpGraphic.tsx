import { forwardRef } from "react";
import type { PlayerGender, Team } from "../types/tournament";
import { RESULTS_BG_URL, RESULTS_EXPORT_W } from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type MvpGraphicProps = {
  tournamentName: string;
  mvpGender: PlayerGender;
  playerName: string;
  team: Team;
  totalKills: number;
};

const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";

const NAME_COLOR = "#F6F3EA";
const GOLD = "#E6C15A";
const PAGE_BG = "#070b14";
const TABLE_BG = "rgba(5, 8, 16, 0.58)";
const ROW_LINE = "rgba(255, 255, 255, 0.08)";

export const MVP_EXPORT_W = RESULTS_EXPORT_W;
export const MVP_EXPORT_MIN_H = 420;
export const MVP_EXPORT_MAX_H = 920;

function genderLabel(gender: PlayerGender): string {
  return gender === "boy" ? "Տղա" : "Աղջիկ";
}

export const MvpGraphic = forwardRef<HTMLDivElement, MvpGraphicProps>(function MvpGraphic(
  { tournamentName, mvpGender, playerName, team, totalKills },
  ref,
) {
  return (
    <div
      ref={ref}
      data-graphic-capture
      lang="hy"
      className="relative shrink-0 overflow-hidden font-board antialiased"
      style={{
        width: MVP_EXPORT_W,
        color: NAME_COLOR,
        backgroundColor: PAGE_BG,
        fontFamily: FONT_BOARD,
        lineHeight: "normal",
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
        style={{ padding: "14px 14px 12px", boxSizing: "border-box" }}
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
            {genderLabel(mvpGender)}
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
            MVP
          </h1>
          <p
            style={{
              margin: "2px 0 0",
              fontFamily: FONT_DISPLAY,
              fontSize: 15,
              fontWeight: 600,
              color: GOLD,
              wordBreak: "break-word",
            }}
          >
            {tournamentName || "Մրցաշար"}
          </p>
        </header>

        <div
          style={{
            marginTop: 8,
            overflow: "hidden",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: TABLE_BG,
            padding: "22px 20px 18px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONT_DISPLAY,
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
              color: NAME_COLOR,
              wordBreak: "break-word",
            }}
          >
            {playerName}
          </h2>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <GraphicTeamRow
              team={team}
              align="center"
              shrinkWrap
              logoPx={40}
              nameFontSize={26}
              nameFontWeight={700}
              nameColor={NAME_COLOR}
              gapPx={12}
            />
          </div>

          <div
            style={{
              marginTop: 18,
              borderTop: `1px solid ${ROW_LINE}`,
              paddingTop: 14,
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "rgba(246, 243, 234, 0.72)",
              }}
            >
              Սպան.
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "0.02em",
                color: GOLD,
              }}
            >
              {totalKills}
            </p>
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
          Լավագույն խաղացող • {genderLabel(mvpGender)} MVP
        </p>
      </div>
    </div>
  );
});

MvpGraphic.displayName = "MvpGraphic";
