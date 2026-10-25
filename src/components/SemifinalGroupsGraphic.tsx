import { forwardRef, type CSSProperties } from "react";
import type { Team } from "../types/tournament";
import { RESULTS_BG_URL, SEMIFINAL_FIELD_EXPORT_W } from "../lib/graphicTheme";

export type SemifinalGroupColumn = {
  id: string;
  name: string;
  teams: Team[];
};

export type SemifinalGroupsGraphicProps = {
  tournamentName: string;
  columns: SemifinalGroupColumn[];
  /** Tiles across one group. Two groups use 2, like a side-by-side poster. One group uses 4. */
  columnsPerGroup?: number;
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

const LOGO_PX = 84;

export const SemifinalGroupsGraphic = forwardRef<HTMLDivElement, SemifinalGroupsGraphicProps>(
  function SemifinalGroupsGraphic({ tournamentName, columns, columnsPerGroup = 2 }, ref) {
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
          style={{ padding: "18px 16px 16px", boxSizing: "border-box" }}
        >
          <p
            style={{
              margin: "0 0 14px",
              textAlign: "center",
              fontFamily: FONT_DISPLAY,
              fontSize: 28,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {tournamentName || "Մրցաշար"}
          </p>
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
            {columns.map((column) => (
              <div key={column.id} style={{ flex: "1 1 0", minWidth: 0 }}>
                <h2
                  style={{
                    margin: "0 0 10px",
                    textAlign: "center",
                    fontFamily: FONT_DISPLAY,
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1.05,
                    ...GOLD_TEXT,
                  }}
                >
                  {column.name}
                </h2>
                {column.teams.length === 0 ? (
                  <p
                    style={{
                      margin: 0,
                      padding: "20px 0",
                      textAlign: "center",
                      fontFamily: FONT_DISPLAY,
                      fontSize: 18,
                      color: GOLD_DIM,
                    }}
                  >
                    —
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${columnsPerGroup}, minmax(0, 1fr))`,
                      gap: 8,
                    }}
                  >
                    {column.teams.map((team) => (
                      <TeamTile key={team.id} team={team} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

SemifinalGroupsGraphic.displayName = "SemifinalGroupsGraphic";

function TeamTile({ team }: { team: Team }) {
  const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        padding: "10px 6px 8px",
        backgroundColor: "rgba(8, 6, 4, 0.38)",
        border: "1px solid rgba(255, 255, 255, 0.28)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: LOGO_PX,
          height: LOGO_PX,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {team.logoDataUrl ? (
          <img
            src={team.logoDataUrl}
            alt=""
            width={LOGO_PX}
            height={LOGO_PX}
            style={{ display: "block", width: LOGO_PX, height: LOGO_PX, objectFit: "contain" }}
          />
        ) : (
          <span
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 32,
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
          maxHeight: 34,
          overflow: "hidden",
          fontFamily: FONT_BOARD,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.03em",
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
}
