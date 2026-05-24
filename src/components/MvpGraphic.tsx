import { forwardRef } from "react";
import type { PlayerGender, Team } from "../types/tournament";
import { GRAPHIC_GOLD_RGB, GRAPHIC_TEXT, RESULTS_EXPORT_W } from "../lib/graphicTheme";

export type MvpGraphicProps = {
  tournamentName: string;
  mvpGender: PlayerGender;
  playerName: string;
  team: Team;
  totalKills: number;
};

const FONT_BOARD = "'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Oswald', system-ui, sans-serif";
const PAGE_BG = "#03050a";
const TOTAL_GOLD = "#FFF3C4";
const FOOTER_TEXT = "ALPHA SEVEN • FINAL STAGE • MVP LEADERS";
const SIDE_PAD = 40;
const MVP_WATERMARK_URL = "/alpha7-table-watermark.png";
const MVP_WATERMARK_OPACITY = 0.028;

export const MVP_EXPORT_W = RESULTS_EXPORT_W;
export const MVP_EXPORT_MIN_H = 640;
export const MVP_EXPORT_MAX_H = 920;

const STAT_CARD_GRADIENT = `linear-gradient(
  165deg,
  rgba(${GRAPHIC_GOLD_RGB}, 0.1) 0%,
  rgba(6, 10, 20, 0.96) 32%,
  rgba(2, 5, 12, 0.99) 100%
)`;

const PLAYER_NAME_SHADOW =
  "0 0 14px rgba(255, 255, 255, 0.22), 0 0 28px rgba(255, 255, 255, 0.07), 0 1px 3px rgba(0, 0, 0, 0.45)";

function MvpBackgroundLayers() {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 720" fill="#0a0e18">
      <ellipse cx="240" cy="120" rx="52" ry="58"/>
      <path d="M140 200 L240 175 L340 200 L320 420 L280 700 L200 700 L160 420 Z"/>
      <path d="M100 240 L60 520 L120 540 L140 280 Z"/>
      <path d="M380 240 L420 520 L360 540 L340 280 Z"/>
    </svg>`,
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <img
        src={MVP_WATERMARK_URL}
        alt=""
        loading="eager"
        decoding="sync"
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          width: "88%",
          height: "72%",
          transform: "translate(-50%, -50%)",
          objectFit: "contain",
          objectPosition: "center",
          opacity: MVP_WATERMARK_OPACITY,
          filter: "blur(5px) brightness(0.45) saturate(0.65) contrast(1.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-8%",
          width: "72%",
          height: "78%",
          transform: "translateX(-50%)",
          backgroundImage: `url("data:image/svg+xml,${svg}")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "contain",
          opacity: 0.03,
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 50% 45% at 50% 52%, rgba(0,0,0,0.35) 0%, transparent 68%)`,
        }}
      />
    </div>
  );
}

function MvpTeamPill({ team }: { team: Team }) {
  const logoPx = 48;
  const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 18px 8px 10px",
        borderRadius: 12,
        background: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.35) 100%)`,
        border: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.38)`,
        boxShadow: `
          inset 0 1px 0 rgba(255,255,255,0.1),
          0 0 20px rgba(${GRAPHIC_GOLD_RGB}, 0.12)
        `,
      }}
    >
      <div
        style={{
          width: logoPx,
          height: logoPx,
          flexShrink: 0,
          borderRadius: 8,
          border: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.35)`,
          overflow: "hidden",
          backgroundColor: "#121a28",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {team.logoDataUrl ? (
          <img
            src={team.logoDataUrl}
            alt=""
            width={logoPx}
            height={logoPx}
            loading="eager"
            decoding="sync"
            style={{
              display: "block",
              width: logoPx,
              height: logoPx,
              objectFit: "contain",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 18,
              fontWeight: 700,
              color: `rgba(${GRAPHIC_GOLD_RGB}, 0.7)`,
            }}
          >
            {initial}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: `rgba(255, 248, 230, 0.95)`,
          whiteSpace: "nowrap",
          maxWidth: 360,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {team.name}
      </span>
    </div>
  );
}

function MvpPremiumStatCard({ totalKills }: { totalKills: number }) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: "28px 44px 24px",
        borderRadius: 16,
        background: STAT_CARD_GRADIENT,
        border: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.36)`,
        boxShadow: `
          0 0 36px rgba(${GRAPHIC_GOLD_RGB}, 0.14),
          0 20px 56px rgba(0, 0, 0, 0.65),
          inset 0 2px 14px rgba(0, 0, 0, 0.55),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -1px 0 rgba(0, 0, 0, 0.4)
        `,
        textAlign: "center",
        minWidth: 340,
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 42%, rgba(0,0,0,0.15) 100%)`,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "8%",
          right: "8%",
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)`,
          pointerEvents: "none",
        }}
      />
      <p
        style={{
          margin: 0,
          position: "relative",
          fontFamily: FONT_DISPLAY,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: `rgba(255, 248, 230, 0.88)`,
        }}
      >
        Total eliminations
      </p>
      <p
        style={{
          margin: "4px 0 0",
          position: "relative",
          fontFamily: FONT_DISPLAY,
          fontSize: 100,
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          fontFeatureSettings: '"tnum" 1',
          color: TOTAL_GOLD,
          textShadow: `0 0 28px rgba(${GRAPHIC_GOLD_RGB}, 0.35), 0 3px 18px rgba(0,0,0,0.5)`,
        }}
      >
        {totalKills}
      </p>
    </div>
  );
}

export const MvpGraphic = forwardRef<HTMLDivElement, MvpGraphicProps>(function MvpGraphic(
  { tournamentName, playerName, team, totalKills },
  ref,
) {
  return (
    <div
      ref={ref}
      data-graphic-capture
      lang="en"
      className="antialiased"
      style={{
        position: "relative",
        width: MVP_EXPORT_W,
        minHeight: MVP_EXPORT_MIN_H,
        lineHeight: "normal",
        fontFamily: FONT_BOARD,
        backgroundColor: PAGE_BG,
        color: GRAPHIC_TEXT,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <MvpBackgroundLayers />

      <header
        style={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          boxSizing: "border-box",
          padding: `24px ${SIDE_PAD}px 18px`,
          textAlign: "center",
          background: "linear-gradient(180deg, #080a0f 0%, #0a0c12 100%)",
          borderBottom: `1px solid rgba(${GRAPHIC_GOLD_RGB}, 0.12)`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: `rgba(${GRAPHIC_GOLD_RGB}, 0.75)`,
          }}
        >
          Final stage MVP
        </p>
        <h1
          style={{
            margin: "6px 0 0",
            fontFamily: FONT_DISPLAY,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#FFF4D6",
            textShadow: `0 0 18px rgba(${GRAPHIC_GOLD_RGB}, 0.14)`,
          }}
        >
          MVP leader
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: FONT_BOARD,
            fontSize: 20,
            fontWeight: 600,
            color: "rgba(240, 244, 252, 0.9)",
            wordBreak: "break-word",
          }}
        >
          {tournamentName}
        </p>
      </header>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `16px ${SIDE_PAD}px 14px`,
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: 49,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color: "#ffffff",
            textAlign: "center",
            maxWidth: "96%",
            wordBreak: "break-word",
            textShadow: PLAYER_NAME_SHADOW,
          }}
        >
          {playerName}
        </h2>

        <div style={{ marginTop: 12 }}>
          <MvpTeamPill team={team} />
        </div>

        <MvpPremiumStatCard totalKills={totalKills} />
      </div>

      <p
        style={{
          position: "relative",
          zIndex: 1,
          flexShrink: 0,
          margin: 0,
          padding: `12px ${SIDE_PAD}px 16px`,
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
  );
});

MvpGraphic.displayName = "MvpGraphic";
