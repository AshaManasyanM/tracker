import type { CSSProperties } from "react";
import type { Team } from "../types/tournament";
import { GRAPHIC_GOLD } from "../lib/graphicTheme";

const GOLD = GRAPHIC_GOLD;

/** Logo + team name in one row — flex layout survives narrow columns and PNG export. */
export function GraphicTeamRow({
  team,
  logoPx = 120,
  nameFontSize = 40,
  gapPx = 24,
  maxNameWidth,
  align = "center",
  nameColor = GOLD,
  nameFontWeight = 600,
  shrinkWrap = false,
}: {
  team: Team;
  logoPx?: number;
  nameFontSize?: number;
  gapPx?: number;
  /** Max width for the name text; omit to use all space left in the cell. */
  maxNameWidth?: number;
  align?: "left" | "center";
  nameColor?: string;
  nameFontWeight?: number;
  /** Shrink row to logo+name width (for centered MVP-style layouts). */
  shrinkWrap?: boolean;
}) {
  const initial = team.name.trim().slice(0, 1).toUpperCase() || "?";

  const logoBox: CSSProperties = {
    flexShrink: 0,
    width: logoPx,
    height: logoPx,
    borderRadius: 8,
    border: "1px solid rgba(255, 255, 255, 0.12)",
    overflow: "hidden",
    backgroundColor: "#121a28",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const nameStyle: CSSProperties = {
    minWidth: 0,
    flex: "1 1 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: "'Rajdhani', 'Noto Sans Armenian', system-ui, sans-serif",
    fontSize: nameFontSize,
    fontWeight: nameFontWeight,
    color: nameColor,
    lineHeight: 1.2,
  };
  if (maxNameWidth != null && maxNameWidth > 0) {
    nameStyle.maxWidth = maxNameWidth;
  } else if (shrinkWrap) {
    nameStyle.flex = "0 1 auto";
  }

  return (
    <div
      data-export-team-row
      style={{
        display: "flex",
        alignItems: "center",
        gap: gapPx,
        width: shrinkWrap ? "auto" : "100%",
        maxWidth: "100%",
        minWidth: 0,
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      <div style={logoBox}>
        {team.logoDataUrl != null && team.logoDataUrl !== "" ? (
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
              objectPosition: "center",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: "'Rajdhani', 'Noto Sans Armenian', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: Math.round(logoPx * 0.35),
              color: "#94a3b8",
              lineHeight: 1,
            }}
            aria-hidden
          >
            {initial}
          </span>
        )}
      </div>
      <span style={nameStyle}>{team.name}</span>
    </div>
  );
}
