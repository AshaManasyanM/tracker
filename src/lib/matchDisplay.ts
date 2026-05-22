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
  return Math.max(0, ...matches.map((m) => resolveMatchDay(m) ?? 0)) + 1;
}

/** Renumber days 1…N after deletions so gaps disappear (e.g. only Day 2 left → Day 1). */
export function compactMatchDays(matches: Match[]): Match[] {
  const usedDays = [
    ...new Set(
      matches
        .map((m) => resolveMatchDay(m))
        .filter((d): d is number => d != null && d > 0),
    ),
  ].sort((a, b) => a - b);

  const remap = new Map(usedDays.map((old, i) => [old, i + 1]));

  return matches.map((m) => {
    const old = resolveMatchDay(m);
    if (old == null || old <= 0) return m;
    const newDay = remap.get(old)!;
    const label = buildMatchLabelFromMeta(newDay, m.map, m.order);
    if (m.day === newDay && m.label === label) return m;
    return { ...m, day: newDay, label };
  });
}

/** Day from `match.day`, or parsed from labels like "Day 2 — Erangel". */
export function resolveMatchDay(match: Pick<Match, "day" | "label">): number | null {
  if (match.day != null && match.day > 0) return Math.floor(match.day);
  const fromLabel = match.label.match(/\bday\s*(\d+)\b/i);
  if (fromLabel) return Number.parseInt(fromLabel[1]!, 10);
  return null;
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
    const d = resolveMatchDay(m) ?? 0;
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
