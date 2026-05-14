import type { MatchTeamResult, Team } from "../types/tournament";
import { normalizeMatchTeamResult } from "./matchResultKills";

/**
 * When a team takes a numeric placement, every other team with that placement loses it (null).
 * The editor row is written last so their placement always wins.
 */
export function applyExclusivePlacement(
  base: Record<string, MatchTeamResult>,
  teams: Team[],
  editorTeamId: string,
  editorNext: MatchTeamResult,
): Record<string, MatchTeamResult> {
  const results: Record<string, MatchTeamResult> = { ...base };
  const p = editorNext.placement;
  if (p === null) {
    results[editorTeamId] = editorNext;
    return results;
  }
  for (const t of teams) {
    if (t.id === editorTeamId) continue;
    const r = results[t.id] ?? { placement: null, kills: 0 };
    if (r.placement !== p) continue;
    results[t.id] = normalizeMatchTeamResult(t, { ...r, placement: null });
  }
  results[editorTeamId] = editorNext;
  return results;
}

/**
 * Keeps the first team (in `teams` order) for each placement; later duplicates are cleared to null.
 * Used after bulk imports when several rows may claim the same rank.
 */
export function dedupePlacementsByTeamListOrder(
  results: Record<string, MatchTeamResult>,
  teams: Team[],
): Record<string, MatchTeamResult> {
  const out: Record<string, MatchTeamResult> = { ...results };
  const seen = new Set<number>();
  for (const t of teams) {
    const r = out[t.id];
    if (!r || r.placement === null) continue;
    const place = r.placement;
    if (seen.has(place)) {
      out[t.id] = normalizeMatchTeamResult(t, { ...r, placement: null });
    } else {
      seen.add(place);
    }
  }
  return out;
}
