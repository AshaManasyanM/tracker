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

/*
 * Visual language matches the group-draw poster (e.g. "GROUP E"):
 * blurred cinema photo + dark overlay, spaced gold kicker between gold rules,
 * big gold-gradient condensed title, glassy rounded cards with a gold left accent,
 * gold two-digit numbers and white condensed team names.
 */
const FONT_CONDENSED = "'Oswald', 'Noto Sans Armenian', system-ui, sans-serif";

const NAME_COLOR = "#FFFFFF";
const STAT_COLOR = "rgba(255, 255, 255, 0.82)";
const GOLD = "#F5B82E";
const GOLD_LIGHT = "#FFE08A";
const GOLD_DEEP = "#D98A0B";
const GOLD_DIM = "rgba(245, 184, 46, 0.55)";
const PAGE_BG = "#0b0806";
const CARD_BG = "rgba(18, 14, 12, 0.58)";
const CARD_BORDER = "rgba(255, 255, 255, 0.14)";

const SIDE_PAD = 18;
const DEFAULT_HEADING = "Եզրափակիչ փուլ";

const COLS = {
  rank: 48,
  wins: 52,
  played: 44,
  kills: 58,
  place: 48,
  total: 70,
} as const;

function hasStandingsData(s: TeamStanding): boolean {
  return s.matchesPlayed > 0 || s.totalPoints > 0;
}

function twoDigit(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function PosterBackground() {
  return (
    <>
      <img
        src={RESULTS_BG_URL}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: -24,
          width: "calc(100% + 48px)",
          height: "calc(100% + 48px)",
          objectFit: "cover",
          objectPosition: "center 30%",
          filter: "blur(5px) saturate(1.1)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10, 7, 5, 0.62) 0%, rgba(10, 7, 5, 0.48) 35%, rgba(10, 7, 5, 0.66) 100%)",
        }}
      />
    </>
  );
}

function Kicker({ text }: { text: string }) {
  const rule: CSSProperties = {
    flex: "0 0 44px",
    height: 2,
    background: GOLD,
    opacity: 0.85,
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <span style={rule} />
      <span
        style={{
          fontFamily: FONT_CONDENSED,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: GOLD,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: RESULTS_EXPORT_W - 180,
          // Letter-spacing adds trailing space; pull it back so the text stays centred.
          marginRight: "-0.32em",
        }}
      >
        {text}
      </span>
      <span style={rule} />
    </div>
  );
}

function ColumnLabels() {
  const label: CSSProperties = {
    fontFamily: FONT_CONDENSED,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    flexShrink: 0,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 10px 6px 13px" }}>
      <span style={{ ...label, width: COLS.rank, color: GOLD_DIM }}>#</span>
      <span style={{ ...label, flex: "1 1 0", textAlign: "left", paddingLeft: 8 }}>Թիմ</span>
      <span style={{ ...label, width: COLS.wins }}>Հաղթ</span>
      <span style={{ ...label, width: COLS.played }}>Խաղ</span>
      <span style={{ ...label, width: COLS.kills }}>Սպան.</span>
      <span style={{ ...label, width: COLS.place }}>Տեղ</span>
      <span style={{ ...label, width: COLS.total, color: GOLD }}>Միավոր</span>
    </div>
  );
}

function StandingCard({ row, index }: { row: TeamStanding; index: number }) {
  const played = hasStandingsData(row);
  const place = row.rank > 0 ? row.rank : index + 1;
  const podium = played && place <= 3;

  const num: CSSProperties = {
    fontFamily: FONT_CONDENSED,
    fontWeight: 600,
    lineHeight: 1,
    textAlign: "center",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: 50,
        padding: "0 10px 0 13px",
        borderRadius: 10,
        border: `1px solid ${podium ? "rgba(245, 184, 46, 0.42)" : CARD_BORDER}`,
        backgroundColor: podium ? "rgba(40, 28, 10, 0.62)" : CARD_BG,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${GOLD_LIGHT}, ${GOLD_DEEP})`,
        }}
      />
      <span style={{ ...num, width: COLS.rank, fontSize: 22, color: played ? GOLD : GOLD_DIM }}>
        {twoDigit(place)}
      </span>
      <div style={{ flex: "1 1 0", minWidth: 0, paddingLeft: 8 }}>
        <GraphicTeamRow
          team={row.team}
          align="left"
          logoPx={36}
          logoRadius={7}
          nameFontSize={22}
          nameFontWeight={600}
          nameColor={NAME_COLOR}
          nameFontFamily={FONT_CONDENSED}
          gapPx={12}
        />
      </div>
      <span style={{ ...num, width: COLS.wins, fontSize: 20, color: STAT_COLOR }}>
        {row.chickenDinners}
      </span>
      <span style={{ ...num, width: COLS.played, fontSize: 20, color: STAT_COLOR }}>
        {row.matchesPlayed}
      </span>
      <span style={{ ...num, width: COLS.kills, fontSize: 20, color: STAT_COLOR }}>
        {row.totalKills}
      </span>
      <span style={{ ...num, width: COLS.place, fontSize: 20, color: STAT_COLOR }}>
        {row.totalPlacementPoints}
      </span>
      <span
        style={{
          ...num,
          width: COLS.total,
          fontSize: 24,
          fontWeight: 700,
          color: played ? GOLD : GOLD_DIM,
        }}
      >
        {row.totalPoints}
      </span>
    </div>
  );
}

export const FinalStageGraphic = forwardRef<HTMLDivElement, FinalStageGraphicProps>(
  function FinalStageGraphic(
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
    const cards: ReactNode[] = rows.map((r, i) => (
      <StandingCard key={r.team.id} row={r} index={i} />
    ));

    return (
      <div
        ref={ref}
        data-graphic-capture
        lang="hy"
        className="relative shrink-0 overflow-hidden antialiased"
        style={{
          width: RESULTS_EXPORT_W,
          color: NAME_COLOR,
          backgroundColor: PAGE_BG,
          fontFamily: FONT_CONDENSED,
          lineHeight: "normal",
        }}
      >
        <PosterBackground />

        <div
          className="relative z-10 flex flex-col"
          style={{
            padding: `20px ${SIDE_PAD}px 14px`,
            boxSizing: "border-box",
          }}
        >
          <header className="shrink-0 text-center" style={{ paddingBottom: 14 }}>
            <Kicker text={tournamentName || "Մրցաշար"} />
            <h1
              style={{
                margin: "6px 0 0",
                fontFamily: FONT_CONDENSED,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.05,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                color: GOLD,
                backgroundImage: `linear-gradient(180deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, ${GOLD_DEEP} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 3px 10px rgba(0, 0, 0, 0.55))",
              }}
            >
              {heading}
            </h1>
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: FONT_CONDENSED,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <span style={{ color: GOLD }}>
                ԽԱՂ {matchCurrent}/{matchTotal}
              </span>
              {"  ·  "}
              {standingsSubtitle}
            </p>
          </header>

          {rows.length === 0 ? (
            <div
              style={{
                borderRadius: 10,
                border: `1px solid ${CARD_BORDER}`,
                backgroundColor: CARD_BG,
                padding: "28px 0",
                textAlign: "center",
                fontSize: 18,
                color: GOLD_DIM,
              }}
            >
              Այս մրցաշարում թիմեր չկան
            </div>
          ) : (
            <>
              <ColumnLabels />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{cards}</div>
            </>
          )}

          <p
            style={{
              margin: "12px 0 0",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            {heading} • {standingsSubtitle}
          </p>
        </div>
      </div>
    );
  },
);

FinalStageGraphic.displayName = "FinalStageGraphic";
