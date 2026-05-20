import type { Player, PlayerGender } from "../types/tournament";

export type { PlayerGender };

export function isPlayerGender(value: unknown): value is PlayerGender {
  return value === "boy" || value === "girl";
}

export function genderLabel(gender: PlayerGender): string {
  return gender === "boy" ? "Boy" : "Girl";
}

export function mvpTitleForGender(gender: PlayerGender): string {
  return gender === "boy" ? "MVP · Boy" : "MVP · Girl";
}

export function playerHasGender(player: Player): player is Player & { gender: PlayerGender } {
  return isPlayerGender(player.gender);
}

export function countPlayersMissingGender(teams: { players?: Player[] }[]): number {
  let n = 0;
  for (const t of teams) {
    for (const p of t.players ?? []) {
      if (!playerHasGender(p)) n++;
    }
  }
  return n;
}
