import type { Tournament } from "../types/tournament";

/**
 * Returns a JSON-serializable deep copy of the tournament for `tournaments.data` in Postgres.
 * Includes teams (names, tags, `logoDataUrl`, rosters), matches (labels, order, `results` with
 * `placement`, `kills`, and per-player `playerKills`), and `activeMatchId` / timestamps — nothing
 * is intentionally omitted vs the in-memory model.
 */
export function tournamentSnapshotForDatabase(t: Tournament): Tournament {
  return JSON.parse(JSON.stringify(t)) as Tournament;
}
