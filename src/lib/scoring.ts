/**
 * Default scoring follows PMGC-style league rules commonly used in 2024–2025 circuits:
 * placement points + 1 point per elimination.
 * Adjust `placementPointsByRank` if your organizer uses a different table.
 */
export const KILL_POINTS_PER_ELIMINATION = 1;

/** 1-based placement → placement points (ranks beyond table receive 0). */
export const placementPointsByRank: Record<number, number> = {
  1: 10,
  2: 6,
  3: 5,
  4: 4,
  5: 3,
  6: 2,
  7: 1,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  13: 0,
  14: 0,
  15: 0,
  16: 0,
};

export function placementPoints(placement: number): number {
  return placementPointsByRank[placement] ?? 0;
}

export function matchPointsForTeam(placement: number | null, kills: number): {
  placementPts: number;
  killPts: number;
  total: number;
} {
  if (placement === null) {
    return { placementPts: 0, killPts: 0, total: 0 };
  }
  const placementPts = placementPoints(placement);
  const killPts = Math.max(0, kills) * KILL_POINTS_PER_ELIMINATION;
  return { placementPts, killPts, total: placementPts + killPts };
}
