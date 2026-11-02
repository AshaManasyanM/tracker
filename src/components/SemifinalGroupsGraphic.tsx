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

const LOGO_PX = 164;
const TILE_W = 248;
const TILE_GAP = 14;

export const SemifinalGroupsGraphic = forwardRef<HTMLDivElement, SemifinalGroupsGraphicProps>(
  function SemifinalGroupsGraphic({ tournamentName, columns, columnsPerGroup = 2 }, ref) {
    const sideBySide = columns.length > 1;
    const logoPx = LOGO_PX;
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
          style={{ padding: "22px 28px 20px", boxSizing: "border-box" }}
        >
          <TournamentBanner name={tournamentName} />
          <div
            style={{
              display: "flex",
              justifyContent: sideBySide ? "space-between" : "center",
              alignItems: "flex-start",
              gap: sideBySide ? 48 : 0,
            }}
          >
            {columns.map((column) => {
              const packedWidth = columnsPerGroup * TILE_W + (columnsPerGroup - 1) * TILE_GAP;
              return (
                <div key={column.id} style={{ width: packedWidth }}>
                  <GroupHeading name={column.name} />
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
                        gridTemplateColumns: `repeat(${columnsPerGroup}, ${TILE_W}px)`,
                        columnGap: TILE_GAP,
                        rowGap: 12,
                      }}
                    >
                      {column.teams.map((team) => (
                        <TeamTile key={team.id} team={team} logoPx={logoPx} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
);

SemifinalGroupsGraphic.displayName = "SemifinalGroupsGraphic";

function tournamentNameLines(name: string): [string, string] {
  const text = name.trim() || "Մրցաշար";
  const budi = text.match(/^(budi\s+budi)\b\s*(.*)$/i);
  if (budi) return [budi[1], budi[2] ?? ""];
  const words = text.split(/\s+/);
  if (words.length < 2) return [text, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function TournamentBanner({ name }: { name: string }) {
  const [first, second] = tournamentNameLines(name);
  return (
    <div style={{ margin: "0 0 18px", textAlign: "center" }}>
      <p
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "0.04em",
          lineHeight: 1.05,
          textTransform: "uppercase",
          color: "#FFFFFF",
        }}
      >
        {first}
      </p>
      {second ? (
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: FONT_DISPLAY,
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: "0.08em",
            lineHeight: 1.05,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {second}
        </p>
      ) : null}
    </div>
  );
}

function GroupHeading({ name }: { name: string }) {
  const rule = (
    <span
      aria-hidden
      style={{
        display: "block",
        width: 56,
        height: 3,
        flex: "0 0 auto",
        backgroundColor: GOLD,
      }}
    />
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        margin: "0 0 12px",
        minHeight: 36,
      }}
    >
      {rule}
      <h2
        style={{
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.08em",
          lineHeight: 1,
          textAlign: "center",
          textTransform: "uppercase",
          ...GOLD_TEXT,
        }}
      >
        {name}
      </h2>
      {rule}
    </div>
  );
}

function TeamTile({ team, logoPx }: { team: Team; logoPx: number }) {
  const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "14px 10px 12px",
        backgroundColor: "rgba(8, 6, 4, 0.22)",
        border: "1px solid rgba(245, 184, 46, 0.45)",
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
            style={{ display: "block", width: logoPx, height: logoPx, objectFit: "contain" }}
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
          maxHeight: 64,
          overflow: "hidden",
          fontFamily: FONT_BOARD,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: "#FFFFFF",
          lineHeight: 1.15,
          textShadow: "0 2px 6px rgba(0, 0, 0, 0.9)",
          textAlign: "center",
          textTransform: "uppercase",
        }}
      >
        {team.name}
      </span>
    </div>
  );
}
