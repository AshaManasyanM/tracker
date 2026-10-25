import { forwardRef, type CSSProperties } from "react";
import type { Team } from "../types/tournament";
import { RESULTS_BG_URL, SEMIFINAL_FIELD_EXPORT_W } from "../lib/graphicTheme";

export type SemifinalFieldGraphicProps = {
  tournamentName: string;
  teams: Team[];
  heading?: string;
};

const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";
const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const PAGE_BG = "#140c06";
const GOLD = "#F5B82E";
const GOLD_DIM = "rgba(245, 184, 46, 0.55)";
const GOLD_GRADIENT = "linear-gradient(180deg, #FFE08A 0%, #F5B82E 55%, #D98A0B 100%)";
const GOLD_TEXT: CSSProperties = {
  color: GOLD,
  backgroundImage: GOLD_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const DEFAULT_HEADING = "Կիսաեզրափակիչ";

export const SemifinalFieldGraphic = forwardRef<HTMLDivElement, SemifinalFieldGraphicProps>(
  function SemifinalFieldGraphic({ tournamentName, teams, heading = DEFAULT_HEADING }, ref) {
    const logoPx = 96;

    return (
      <div
        ref={ref}
        data-graphic-capture
        lang="hy"
        className="relative shrink-0 overflow-hidden font-board antialiased"
        style={{
          width: SEMIFINAL_FIELD_EXPORT_W,
          color: "#FFFFFF",
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
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(24, 12, 4, 0.08) 0%, rgba(24, 12, 4, 0.42) 100%)",
          }}
        />

        <div
          className="relative z-10 flex flex-col"
          style={{ padding: "14px 14px 12px", boxSizing: "border-box" }}
        >
          <header className="shrink-0 text-center" style={{ paddingBottom: 14 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.05,
                ...GOLD_TEXT,
              }}
            >
              {heading}
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: 32,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {tournamentName || "Մրցաշար"}
            </p>
          </header>

          {teams.length === 0 ? (
            <p
              style={{
                margin: "8px 0 0",
                padding: "28px 0",
                textAlign: "center",
                fontFamily: FONT_DISPLAY,
                fontSize: 28,
                color: GOLD_DIM,
              }}
            >
              Կիսաեզրափակիչում թիմեր չկան
            </p>
          ) : (
            <div
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
                gap: 8,
              }}
            >
              {teams.map((team) => {
                const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";
                return (
                  <div
                    key={team.id}
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 6,
                      minHeight: logoPx + 52,
                      padding: "10px 6px 8px",
                      backgroundColor: "rgba(8, 6, 4, 0.38)",
                      border: "1px solid rgba(255, 255, 255, 0.28)",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: logoPx,
                        height: logoPx,
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
                            fontWeight: 700,
                            fontSize: 36,
                            color: "#94a3b8",
                            lineHeight: 1,
                          }}
                        >
                          {initial}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        width: "100%",
                        maxHeight: 36,
                        overflow: "hidden",
                        fontFamily: FONT_BOARD,
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: "#FFFFFF",
                        lineHeight: 1.15,
                        textAlign: "center",
                        textTransform: "uppercase",
                      }}
                    >
                      {team.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <p
            style={{
              margin: "12px 0 0",
              textAlign: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 24,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            {heading} • {teams.length} թիմ
          </p>
        </div>
      </div>
    );
  },
);

SemifinalFieldGraphic.displayName = "SemifinalFieldGraphic";
