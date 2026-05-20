export type PlayerGender = "boy" | "girl";

export type Player = {
  id: string;
  /** In-game name or real name — extend later with IGN/role fields if needed */
  name: string;
  /** Boy or girl — required when adding; needed for separate boy/girl MVP. */
  gender?: PlayerGender;
};

export type Team = {
  id: string;
  /** Display name shown on leaderboard and admin grids */
  name: string;
  /** Optional short tag for compact UI */
  tag?: string;
  /**
   * Square-ish logo as a data URL (JPEG), produced by the in-app uploader.
   * Kept small for localStorage + JSON export.
   */
  logoDataUrl?: string;
  /** Active roster; when non-empty, match kills are tracked per player and summed for scoring */
  players?: Player[];
};

/** One row of results for a team in a single match */
export type MatchTeamResult = {
  /** 1 = winner; null = did not play this match */
  placement: number | null;
  /** Total elims for scoring — equals sum of `playerKills` when a roster exists */
  kills: number;
  /** Per-player elim count for this match (keys are `Player.id`) */
  playerKills?: Record<string, number>;
};

export type Match = {
  id: string;
  /** Auto-built from day + map (e.g. "Day 2 — Erangel"); fallback "Match N" if both empty */
  label: string;
  /** Competition day number (1 = Day 1) */
  day?: number;
  /** Map name (Erangel, Miramar, Sanhok, etc.) */
  map?: string;
  /** Sort order within the tournament */
  order: number;
  /** teamId → result */
  results: Record<string, MatchTeamResult>;
};

export type Tournament = {
  /** Row id — same as Supabase tournaments.id when saved to cloud */
  id: string;
  name: string;
  /** Full squad list: logos (`logoDataUrl`), rosters (`players`), tags — persisted in DB json `data` */
  teams: Team[];
  /** All rounds; each `results[teamId]` holds placement, kills, and optional `playerKills` per roster member */
  matches: Match[];
  /** Currently focused match in admin UI */
  activeMatchId: string | null;
  createdAt: number;
  updatedAt: number;
};

export const STORAGE_KEY = "pubgm-scrim-command.tournament.v1";
