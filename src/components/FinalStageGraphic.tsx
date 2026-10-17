import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { TeamStanding } from "../lib/standings";
import { RESULTS_BG_URL, RESULTS_EXPORT_W } from "../lib/graphicTheme";
import { GraphicTeamRow } from "./GraphicTeamRow";

export type FinalStageGraphicProps = {
  tournamentName: string;
  rows: TeamStanding[];
  matchCurrent: number;
  matchTotal: number;
  standingsSubtitle?: string;
  /** Big title. Group tables use the group name; finals keep the default. */
  heading?: string;
};

const DEFAULT_HEADING = "Եզրափակիչ փուլ";

const FONT_BOARD = "'Noto Sans Armenian', 'Rajdhani', system-ui, sans-serif";
const FONT_DISPLAY = "'Noto Sans Armenian', 'Oswald', system-ui, sans-serif";

const NAME_COLOR = "#FFFFFF";
const STAT_COLOR = "rgba(255, 246, 225, 0.78)";
const GOLD = "#F5B82E";
const GOLD_DIM = "rgba(245, 184, 46, 0.5)";
const PAGE_BG = "#0b0806";
const TABLE_BG = "rgba(14, 10, 6, 0.5)";
const ROW_LINE = "rgba(255, 220, 150, 0.12)";

function placeTone(rank: number): { background: string; rank: string } {
  if (rank === 1) return { background: "rgba(245, 184, 46, 0.16)", rank: "#FFD666" };
  if (rank === 2) return { background: "rgba(214, 220, 230, 0.1)", rank: "#E4E7EE" };
  if (rank === 3) return { background: "rgba(184, 122, 66, 0.16)", rank: "#E0A36A" };
  return { background: "transparent", rank: GOLD };
}

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function StandingsTable({ rows }: { rows: TeamStanding[] }) {
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
    color: "rgba(255, 246, 225, 0.7)",
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
          {r.totalPoints}
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

export const FinalStageGraphic = forwardRef<HTMLDivElement, FinalStageGraphicProps>(function FinalStageGraphic(
  {
    tournamentName,
    rows,
    matchCurrent,
    matchTotal,
    standingsSubtitle = "Ընդհանուր աղյուսակ",
    heading = DEFAULT_HEADING,
  },
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
          background:
            "linear-gradient(180deg, rgba(10, 7, 5, 0.66) 0%, rgba(10, 7, 5, 0.56) 40%, rgba(10, 7, 5, 0.68) 100%)",
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
            borderBottom: "1px solid rgba(245, 184, 46, 0.3)",
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
                textTransform: "uppercase",
                color: "#FFFFFF",
                wordBreak: "break-word",
              }}
            >
              {heading}
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: FONT_DISPLAY,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.1,
                color: GOLD,
                wordBreak: "break-word",
              }}
            >
              {standingsSubtitle}
            </p>
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
              color: GOLD,
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
              border: "1px solid rgba(245, 184, 46, 0.18)",
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
              <StandingsTable rows={rows} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

FinalStageGraphic.displayName = "FinalStageGraphic";
