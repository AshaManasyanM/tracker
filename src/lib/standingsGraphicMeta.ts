import type { Match } from "../types/tournament";
import { resolveMatchDay } from "./matchDisplay";

function matchHasScores(m: Match): boolean {
  return Object.values(m.results).some((r) => r != null && r.placement != null);
}

/** Match counter for standings graphic header (maps scored / maps scheduled). */
export function standingsGraphicMeta(matches: Match[]): {
  matchCurrent: number;
  matchTotal: number;
} {
  const sorted = [...matches].sort(
    (a, b) =>
      (resolveMatchDay(a) ?? 0) - (resolveMatchDay(b) ?? 0) ||
      a.order - b.order ||
      a.id.localeCompare(b.id),
  );
  const matchTotal = Math.max(1, sorted.length);
  const matchCurrent = sorted.filter(matchHasScores).length;

  return {
    matchCurrent,
    matchTotal,
  };
}
