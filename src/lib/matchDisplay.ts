import type { Match } from "../types/tournament";

/** Label for selectors and lists — prefers day + map when set. */
export function formatMatchDisplay(match: Pick<Match, "label" | "day" | "map">): string {
  const parts: string[] = [];
  if (match.day != null && match.day > 0) parts.push(`Day ${match.day}`);
  const map = match.map?.trim();
  if (map) parts.push(map);
  if (parts.length > 0) return parts.join(" — ");
  return match.label;
}

export function buildMatchLabelFromMeta(
  day: number | undefined,
  map: string | undefined,
  fallbackIndex: number,
): string {
  const d = day != null && day > 0 ? day : undefined;
  const m = map?.trim() || undefined;
  if (d != null && m) return `Day ${d} — ${m}`;
  if (d != null) return `Day ${d}`;
  if (m) return m;
  return `Match ${fallbackIndex + 1}`;
}

export function nextMatchDay(matches: Match[]): number {
  if (matches.length === 0) return 1;
  return Math.max(0, ...matches.map((m) => m.day ?? 0)) + 1;
}

export type MatchDayGroup = {
  day: number;
  title: string;
  matches: Match[];
};

/** Group lobbies by day for accordions (day 0 = unset, listed last). */
export function groupMatchesByDay(matches: Match[]): MatchDayGroup[] {
  const groups = new Map<number, Match[]>();
  for (const m of matches) {
    const d = m.day != null && m.day > 0 ? m.day : 0;
    const list = groups.get(d) ?? [];
    list.push(m);
    groups.set(d, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  }
  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    })
    .map(([day, dayMatches]) => ({
      day,
      title: day > 0 ? `Day ${day}` : "No day set",
      matches: dayMatches,
    }));
}
