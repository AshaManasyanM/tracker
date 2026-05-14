import type { Tournament } from "../types/tournament";
import { STORAGE_KEY } from "../types/tournament";

export function loadTournament(): Tournament | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Tournament;
    if (!data || typeof data !== "object" || !Array.isArray(data.teams)) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveTournament(t: Tournament): void {
  const payload: Tournament = { ...t, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearTournament(): void {
  localStorage.removeItem(STORAGE_KEY);
}
