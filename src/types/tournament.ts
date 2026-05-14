export type Player = {
  id: string;
  /** In-game name or real name — extend later with IGN/role fields if needed */
  name: string;
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
  /** Shown in selectors, e.g. "Round 3 — Erangel" */
  label: string;
  /** Sort order within the tournament */
  order: number;
  /** teamId → result */
  results: Record<string, MatchTeamResult>;
};

export type Tournament = {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
  /** Currently focused match in admin UI */
  activeMatchId: string | null;
  createdAt: number;
  updatedAt: number;
};

export const MAX_TEAMS = 20;

export const STORAGE_KEY = "pubgm-scrim-command.tournament.v1";
