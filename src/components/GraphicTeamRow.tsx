import type { Team } from "../types/tournament";
import { GRAPHIC_GOLD } from "../lib/graphicTheme";

const GOLD = GRAPHIC_GOLD;

/** Logo + team name in one row — table layout survives PNG export. */
export function GraphicTeamRow({
  team,
  logoPx = 120,
  nameFontSize = 40,
  gapPx = 24,
  maxNameWidth = 400,
  align = "center",
  nameColor = GOLD,
}: {
  team: Team;
  logoPx?: number;
  nameFontSize?: number;
  gapPx?: number;
  maxNameWidth?: number;
  align?: "left" | "center";
  nameColor?: string;
}) {
  const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";

  const logo =
    team.logoDataUrl != null && team.logoDataUrl !== "" ? (
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
          objectFit: "cover",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      />
    ) : (
      <div
        style={{
          display: "block",
          width: logoPx,
          height: logoPx,
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backgroundColor: "#121a28",
          fontFamily: "'Rajdhani', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: Math.round(logoPx * 0.35),
          color: "#94a3b8",
          lineHeight: `${logoPx}px`,
          textAlign: "center",
        }}
        aria-hidden
      >
        {initial}
      </div>
    );

  const margin =
    align === "left"
      ? { marginLeft: 0, marginRight: 0 }
      : { marginLeft: "auto", marginRight: "auto" };

  return (
    <div
      data-export-team-row
      style={{
        display: "table",
        borderCollapse: "collapse",
        ...margin,
      }}
    >
      <div style={{ display: "table-row" }}>
        <div
          style={{
            display: "table-cell",
            verticalAlign: "middle",
            paddingRight: gapPx,
            lineHeight: 0,
            whiteSpace: "nowrap",
          }}
        >
          {logo}
        </div>
        <div
          style={{
            display: "table-cell",
            verticalAlign: "middle",
            whiteSpace: "nowrap",
            fontFamily: "'Rajdhani', system-ui, sans-serif",
            fontSize: nameFontSize,
            fontWeight: 600,
            color: nameColor,
            lineHeight: `${logoPx}px`,
            height: logoPx,
            maxWidth: maxNameWidth,
          }}
        >
          <span style={{ display: "inline-block", verticalAlign: "middle", lineHeight: 1.15 }}>
            {team.name}
          </span>
        </div>
      </div>
    </div>
  );
}
