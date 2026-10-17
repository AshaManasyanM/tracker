import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { TeamStanding } from "../lib/standings";
import { RESULTS_BG_URL, RESULTS_EXPORT_W } from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FastResGraphicProps = {
  tournamentName: string;
  rows: TeamStanding[];
  matchCurrent: number;
  matchTotal: number;
  /** Group name, or the finals title. Omitted on a single-field board. */
  heading?: string;
};

const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";

const NAME_COLOR = "#FFFFFF";
/* Same palette as the photo poster (FinalStageGraphic). */
const STAT_COLOR = "rgba(255, 255, 255, 0.82)";
const GOLD = "#F5B82E";
const GOLD_DIM = "rgba(245, 184, 46, 0.55)";
const PAGE_BG = "#140c06";
const TABLE_BG = "rgba(22, 13, 6, 0.42)";
const ROW_LINE = "rgba(255, 255, 255, 0.08)";
/** Same gold gradient as the group-draw posters ("GROUP B" title). */
const GOLD_GRADIENT = "linear-gradient(180deg, #FFE08A 0%, #F5B82E 55%, #D98A0B 100%)";
const GOLD_TEXT: CSSProperties = {
  color: GOLD,
  backgroundImage: GOLD_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
};


function placeTone(rank: number): { background: string; rank: string } {
  if (rank === 1) return { background: "rgba(245, 184, 46, 0.16)", rank: "#FFC94A" };
  if (rank === 2) return { background: "rgba(214, 220, 230, 0.09)", rank: "#E4E7EE" };
  if (rank === 3) return { background: "rgba(184, 122, 66, 0.12)", rank: "#E0A36A" };
  return { background: "transparent", rank: GOLD };
}

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function FastResTable({ rows }: { rows: TeamStanding[] }) {
  const rowPadY = 4;
  const headPy = 8;
  const headFontPx = 13;
  const statFontPx = 22;
  const rankFontPx = 24;
  const totalFontPx = 24;
  const teamLogoPx = 32;
  const teamNamePx = 24;
  const rankColW = 46;
  const statPadX = 4;
  const totalPadX = 6;
  const rowHeight = teamLogoPx + rowPadY * 2 + 6;

  const numberFontBase: CSSProperties = {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    letterSpacing: "0.02em",
    lineHeight: 1,
  };

  const headTh: CSSProperties = {
    fontFamily: FONT_DISPLAY,
    color: "rgba(255, 255, 255, 0.75)",
    background: "transparent",
    whiteSpace: "nowrap",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "0.04em",
  };

  const bodyRows: ReactNode[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]!;
    const played = hasStandingsData(r);
    const place = r.rank > 0 ? r.rank : i + 1;
    const tone = placeTone(place);

    bodyRows.push(
      <tr
        key={r.team.id}
        style={{
          height: rowHeight,
          borderBottom: `1px solid ${ROW_LINE}`,
          backgroundColor: tone.background,
        }}
      >
        <td className="text-center" style={{ verticalAlign: "middle", padding: `${rowPadY}px 4px` }}>
          <span
            style={{
              ...numberFontBase,
              fontSize: rankFontPx,
              color: played ? tone.rank : GOLD_DIM,
              ...(played && (place === 1 || place > 3) ? GOLD_TEXT : {}),
            }}
          >
            {place}
          </span>
        </td>
        <td
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px 6px ${rowPadY}px 8px`,
            overflow: "hidden",
            maxWidth: 0,
          }}
        >
          <GraphicTeamRow
            team={r.team}
            align="left"
            logoPx={teamLogoPx}
            nameFontSize={teamNamePx}
            nameFontWeight={700}
            nameColor={NAME_COLOR}
            gapPx={10}
          />
        </td>
        {[r.chickenDinners, r.matchesPlayed, r.totalKills, r.totalPlacementPoints].map((value, idx) => (
          <td
            key={idx}
            className="text-center"
            style={{
              verticalAlign: "middle",
              padding: `${rowPadY}px ${statPadX}px`,
              ...numberFontBase,
              fontSize: statFontPx,
              color: STAT_COLOR,
            }}
          >
            {value}
          </td>
        ))}
        <td
          className="text-center"
          style={{
            verticalAlign: "middle",
            padding: `${rowPadY}px ${totalPadX}px`,
            ...numberFontBase,
            fontSize: totalFontPx,
            color: played ? GOLD : GOLD_DIM,
          }}
        >
          <span style={played ? GOLD_TEXT : undefined}>{r.totalPoints}</span>
        </td>
      </tr>,
    );
  }

  const headers = ["#", "Թիմ", "Հաղթ", "Խաղ", "Սպան.", "Տեղ", "Միավոր"] as const;

  return (
    <table className="w-full border-collapse" style={{ tableLayout: "fixed", width: "100%" }}>
      <colgroup>
        <col style={{ width: rankColW }} />
        <col />
        <col style={{ width: 56 }} />
        <col style={{ width: 48 }} />
        <col style={{ width: 62 }} />
        <col style={{ width: 52 }} />
        <col style={{ width: 72 }} />
      </colgroup>
      <thead>
        <tr style={{ boxShadow: `inset 0 -1px 0 ${ROW_LINE}` }}>
          {headers.map((label) => {
            const isTeam = label === "Թիմ";
            const isTotal = label === "Միավոր";
            return (
              <th
                key={label}
                className={isTeam ? "text-left" : "text-center"}
                style={{
                  ...headTh,
                  fontSize: headFontPx,
                  padding: `${headPy}px ${isTeam ? 8 : isTotal ? totalPadX : statPadX}px`,
                  borderBottom: `1px solid ${ROW_LINE}`,
                  color: isTotal ? GOLD : headTh.color,
                  ...(isTotal ? GOLD_TEXT : {}),
                }}
              >
                {label}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>{bodyRows}</tbody>
    </table>
  );
}

export const FastResGraphic = forwardRef<HTMLDivElement, FastResGraphicProps>(function FastResGraphic(
  { tournamentName, rows, matchCurrent, matchTotal, heading },
  ref,
) {
  return (
    <div
      ref={ref}
      data-graphic-capture
      lang="hy"
      className="relative shrink-0 overflow-hidden font-board antialiased"
      style={{
        width: RESULTS_EXPORT_W,
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
          // Oversize slightly so the blur doesn't show soft edges.
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
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            paddingBottom: 10,
            borderBottom: "1px solid rgba(245, 184, 46, 0.4)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_DISPLAY,
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "0.08em",
                color: "#FFFFFF",
              }}
            >
              FAST{" "}
              <span style={GOLD_TEXT}>RES</span>
            </p>
            {heading ? (
              <p
                style={{
                  margin: "6px 0 0",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  wordBreak: "break-word",
                }}
              >
                {heading}
              </p>
            ) : null}
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: FONT_BOARD,
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.88)",
                wordBreak: "break-word",
              }}
            >
              {tournamentName || "Մրցաշար"}
            </p>
          </div>
          <p
            style={{
              margin: 0,
              flexShrink: 0,
              fontFamily: FONT_DISPLAY,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.06em",
              ...GOLD_TEXT,
              textAlign: "right",
            }}
          >
            ԽԱՂ {matchCurrent}/{matchTotal}
          </p>
        </header>

        <div style={{ marginTop: 8 }}>
          <div
            style={{
              overflow: "hidden",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.14)",
              backgroundColor: TABLE_BG,
              padding: "4px 6px 6px",
            }}
          >
            {rows.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  padding: "28px 0",
                  textAlign: "center",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 18,
                  color: GOLD_DIM,
                }}
              >
                Այս մրցաշարում թիմեր չկան
              </p>
            ) : (
              <FastResTable rows={rows} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FastResGraphic.displayName = "FastResGraphic";
