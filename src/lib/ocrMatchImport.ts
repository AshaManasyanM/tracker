import type { Player, Team } from "../types/tournament";

export type OcrMatchedRow = {
  teamId: string;
  teamName: string;
  placement: number;
  kills: number;
  sourceLine: string;
  /** When import parsed per-player lines (PUBG statistics screen). */
  playerKillsById?: Record<string, number>;
};

export type OcrUnmatchedLine = {
  sourceLine: string;
  reason: string;
};

/** Parsed from a line when no roster team substring-matched — will create a new team on import. */
export type OcrNewTeamRow = {
  inferredName: string;
  placement: number;
  kills: number;
  sourceLine: string;
};

export type ParseLeaderboardResult = {
  matched: OcrMatchedRow[];
  /** Names read from the board that are not on your roster (import will add teams, up to max squads). */
  newTeams: OcrNewTeamRow[];
  unmatchedLines: OcrUnmatchedLine[];
};

/** Rows sent to `importOcrMatchSnapshot` (single transaction). */
export type OcrImportRow =
  | {
      kind: "existing";
      teamId: string;
      placement: number;
      kills: number;
      /** Per-player elims when OCR matched IGNs to roster (PUBG statistics layout). */
      playerKills?: Record<string, number>;
    }
  | { kind: "new"; name: string; placement: number; kills: number };

export function buildOcrImportRows(parsed: ParseLeaderboardResult): OcrImportRow[] {
  const rows: OcrImportRow[] = [];
  for (const m of parsed.matched) {
    rows.push({
      kind: "existing",
      teamId: m.teamId,
      placement: m.placement,
      kills: m.kills,
      ...(m.playerKillsById && Object.keys(m.playerKillsById).length > 0
        ? { playerKills: m.playerKillsById }
        : {}),
    });
  }
  for (const n of parsed.newTeams) {
    rows.push({ kind: "new", name: n.inferredName, placement: n.placement, kills: n.kills });
  }
  return rows;
}

/** How many new squads the import would create (names not already on the roster). */
export function countOcrNewSquadsToCreate(parsed: ParseLeaderboardResult, teams: Team[]): number {
  const norms = new Set(
    parsed.newTeams.map((n) => normalizeOcrToken(n.inferredName)).filter(Boolean),
  );
  let c = 0;
  for (const norm of norms) {
    if (!teams.some((t) => normalizeOcrToken(t.name) === norm)) c++;
  }
  return c;
}

/** Lowercase alphanumerics only — tolerates OCR punctuation between letters. */
export function normalizeOcrToken(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Split team name into fuzzy tokens (length ≥ 3) for partial OCR hits. */
function teamSearchKeys(team: Team): string[] {
  const flat = normalizeOcrToken(team.name);
  if (flat.length <= 3) return flat ? [flat] : [];
  const keys = new Set<string>([flat]);
  for (const raw of team.name.split(/[\s\-_.|[\]()/]+/)) {
    const t = normalizeOcrToken(raw);
    if (t.length >= 3) keys.add(t);
  }
  return [...keys].sort((a, b) => b.length - a.length);
}

function lineMatchesTeamKeys(lineNorm: string, keys: string[]): boolean {
  for (const k of keys) {
    if (k.length >= 4 && lineNorm.includes(k)) return true;
    if (k.length === 3 && lineNorm.includes(k)) return true;
  }
  return false;
}

/**
 * Picks placement (1–16) and elim count from a noisy scoreboard line.
 * Ignores large integers (typical damage / IDs).
 */
export function extractPlacementAndKillsFromLine(line: string): {
  placement: number;
  kills: number;
} | null {
  const hits: { index: number; value: number }[] = [];
  const re = /\d+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    hits.push({ index: m.index, value: Number(m[0]) });
  }
  if (hits.length < 2) return null;

  const placeHit = hits.find((h) => h.value >= 1 && h.value <= 16);
  if (!placeHit) return null;
  const placement = placeHit.value;

  let kills = 0;
  for (let i = hits.length - 1; i >= 0; i--) {
    const v = hits[i]!.value;
    if (v > 60) continue;
    kills = v;
    break;
  }

  if (hits.every((h) => h.value > 60)) return { placement, kills: 0 };

  return { placement, kills: Math.max(0, Math.min(200, kills)) };
}

const SKIP_LINE =
  /^(rank|placement|team\b|squad\b|#|pos|pts|points?|elim|kill|damage|survived|no\.?|lobby)/i;

function shouldSkipLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 4) return true;
  const head = t.slice(0, 48).toLowerCase();
  return SKIP_LINE.test(head);
}

/**
 * Middle segment of a scoreboard line: tokens after placement rank, before trailing numeric stats.
 */
export function inferTeamNameFromScoreboardLine(line: string, placement: number): string {
  const parts = line.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "";

  let startIdx = 0;
  const firstN = Number(parts[0]?.replace(/^#/, ""));
  if (firstN === placement) {
    startIdx = 1;
  } else {
    for (let i = 0; i < parts.length; i++) {
      const n = Number(parts[i]!.replace(/^#/, ""));
      if (n === placement) {
        startIdx = i + 1;
        break;
      }
    }
  }

  let endIdx = parts.length;
  while (endIdx > startIdx && /^\d+$/.test(parts[endIdx - 1]!)) {
    endIdx--;
  }

  const name = parts
    .slice(startIdx, endIdx)
    .join(" ")
    .replace(/^[|.:)\-–—]\s*/, "")
    .trim();

  return name.slice(0, 120);
}

/** PUBG “Statistics → Match results” style: one line per player, kills after an em dash and optional Russian label. */
type PubgKillLine = { name: string; kills: number; sourceLine: string };

function stripPlayerNameNoise(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Extracts `PlayerName — 5 уничтожений`-style rows (tolerates OCR garbling the Cyrillic word).
 */
export function extractPubgStylePlayerKillLines(raw: string): PubgKillLine[] {
  const out: PubgKillLine[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (t.length < 5) continue;

    /** Kills are always the small integer after the *last* em/en/ascii dash (IGNs may contain digits). */
    const rm = t.match(/\s*[-–—]\s*(\d{1,2})\s*(?:уничтож\w*|уни\w{2,}|kills?\b|elim\w*)?\s*$/iu);
    if (!rm || rm.index === undefined || rm.index < 2) continue;

    const rawName = stripPlayerNameNoise(t.slice(0, rm.index));
    if (rawName.length < 2) continue;
    const kills = Math.min(30, Math.max(0, parseInt(rm[1]!, 10)));
    if (!Number.isFinite(kills)) continue;
    out.push({ name: rawName, kills, sourceLine: t });
  }
  return out;
}

function inferPubgSquadLabel(players: PubgKillLine[]): string {
  const names = players.map((p) => p.name).filter(Boolean);
  if (names.length === 0) return "Squad";
  let prefix = names[0]!;
  for (const n of names.slice(1)) {
    let i = 0;
    const lim = Math.min(prefix.length, n.length);
    while (i < lim && prefix[i]!.toLowerCase() === n[i]!.toLowerCase()) i++;
    prefix = prefix.slice(0, i);
  }
  prefix = prefix.replace(/[^A-Za-z0-9]+$/g, "").slice(0, 28);
  if (prefix.length >= 2) return prefix;
  return names[0]!.slice(0, 20) || "Squad";
}

function scorePubgSquadAgainstTeam(players: PubgKillLine[], team: Team): number {
  let s = 0;
  const tn = normalizeOcrToken(team.name);
  const tag = team.tag ? normalizeOcrToken(team.tag) : "";
  for (const pl of players) {
    const sn = normalizeOcrToken(pl.name);
    if (tn.length >= 3 && sn.includes(tn)) s += 10;
    if (tag.length >= 2 && sn.includes(tag)) s += 8;
  }
  const roster = team.players ?? [];
  for (const r of roster) {
    const rn = normalizeOcrToken(r.name);
    if (rn.length < 2) continue;
    for (const pl of players) {
      const sn = normalizeOcrToken(pl.name);
      if (sn === rn) s += 12;
      else if (sn.includes(rn) || rn.includes(sn)) s += 6;
      else if (rn.length >= 4 && sn.includes(rn.slice(0, 4))) s += 3;
    }
  }
  const lab = normalizeOcrToken(inferPubgSquadLabel(players));
  if (lab.length >= 2 && tn.includes(lab)) s += 4;
  return s;
}

function matchPubgSquadToPlayerKills(
  players: PubgKillLine[],
  team: Team,
): Record<string, number> | null {
  const roster = team.players ?? [];
  if (roster.length === 0 || roster.length !== players.length) return null;
  const used = new Set<string>();
  const pk: Record<string, number> = {};
  for (const pl of players) {
    let best: { id: string; sc: number } | null = null;
    const sn = normalizeOcrToken(pl.name);
    for (const r of roster) {
      if (used.has(r.id)) continue;
      const rn = normalizeOcrToken(r.name);
      let sc = 0;
      if (sn === rn) sc = 100;
      else if (sn.includes(rn) || rn.includes(sn)) sc = 50;
      else if (rn.length >= 4 && sn.includes(rn.slice(0, 4))) sc = 22;
      else if (rn.length >= 3 && sn.includes(rn.slice(0, 3))) sc = 12;
      if (!best || sc > best.sc) best = { id: r.id, sc };
    }
    if (!best || best.sc < 12) return null;
    pk[best.id] = pl.kills;
    used.add(best.id);
  }
  return pk;
}

const PUBG_SQUAD_SCORE_THRESHOLD = 6;

/**
 * Parses the “Match results” statistics layout: blocks of four `IGN — kills` lines (Russian or English kill label).
 * Returns null if the text does not look like that format (falls back to single-line leaderboard parsing).
 */
export function tryParsePubgStatisticsMatchScreen(
  raw: string,
  teams: Team[],
): ParseLeaderboardResult | null {
  const killLines = extractPubgStylePlayerKillLines(raw);
  if (killLines.length < 4) return null;

  const squads: PubgKillLine[][] = [];
  for (let i = 0; i + 4 <= killLines.length; i += 4) {
    squads.push(killLines.slice(i, i + 4));
  }
  if (squads.length === 0) return null;

  const matched: OcrMatchedRow[] = [];
  const newTeams: OcrNewTeamRow[] = [];
  const unmatchedLines: OcrUnmatchedLine[] = [];
  const consumedTeamIds = new Set<string>();

  let placement = 1;
  for (const squad of squads) {
    const teamKills = squad.reduce((a, p) => a + p.kills, 0);
    const label = inferPubgSquadLabel(squad);
    const preview = squad.map((p) => p.sourceLine).join(" · ");

    let bestTeam: Team | null = null;
    let bestScore = 0;
    for (const team of teams) {
      if (consumedTeamIds.has(team.id)) continue;
      const sc = scorePubgSquadAgainstTeam(squad, team);
      if (sc > bestScore) {
        bestScore = sc;
        bestTeam = team;
      }
    }

    if (bestTeam && bestScore >= PUBG_SQUAD_SCORE_THRESHOLD) {
      consumedTeamIds.add(bestTeam.id);
      const pk = matchPubgSquadToPlayerKills(squad, bestTeam);
      matched.push({
        teamId: bestTeam.id,
        teamName: bestTeam.name,
        placement,
        kills: teamKills,
        sourceLine: preview,
        playerKillsById: pk ?? undefined,
      });
    } else {
      newTeams.push({
        inferredName: label,
        placement,
        kills: teamKills,
        sourceLine: preview,
      });
    }
    placement += 1;
  }

  return { matched, newTeams, unmatchedLines };
}

/**
 * Map OCR / pasted scoreboard text to tournament teams (placement + team elims).
 * Lines are matched if normalized line contains a team name key; numbers are parsed heuristically.
 */
export function parseLeaderboardFromOcrText(raw: string, teams: Team[]): ParseLeaderboardResult {
  const pubg = tryParsePubgStatisticsMatchScreen(raw, teams);
  if (pubg && pubg.matched.length + pubg.newTeams.length > 0) {
    return pubg;
  }

  const matched: OcrMatchedRow[] = [];
  const unmatchedLines: OcrUnmatchedLine[] = [];
  const newTeamByNorm = new Map<string, OcrNewTeamRow>();

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const used = new Set<number>();
  const consumedTeams = new Set<string>();

  const sortedTeams = [...teams].sort(
    (a, b) => normalizeOcrToken(b.name).length - normalizeOcrToken(a.name).length,
  );

  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i]!;
    if (shouldSkipLine(line)) continue;

    const lineNorm = normalizeOcrToken(line);
    if (lineNorm.length < 4) continue;

    let bestTeam: Team | null = null;
    for (const team of sortedTeams) {
      if (consumedTeams.has(team.id)) continue;
      const keys = teamSearchKeys(team);
      if (keys.length === 0) continue;
      if (lineMatchesTeamKeys(lineNorm, keys)) {
        bestTeam = team;
        break;
      }
    }

    if (!bestTeam) continue;

    const nums = extractPlacementAndKillsFromLine(line);
    if (!nums) {
      used.add(i);
      unmatchedLines.push({
        sourceLine: line,
        reason: `Matched “${bestTeam.name}” but could not read placement + elims`,
      });
      continue;
    }

    used.add(i);
    consumedTeams.add(bestTeam.id);
    matched.push({
      teamId: bestTeam.id,
      teamName: bestTeam.name,
      placement: nums.placement,
      kills: nums.kills,
      sourceLine: line,
    });
  }

  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue;
    const line = lines[i]!;
    if (shouldSkipLine(line)) continue;
    const t = line.trim();
    if (!/^#?\d/.test(t)) continue;
    const nums = extractPlacementAndKillsFromLine(line);
    if (!nums) continue;

    const inferred = inferTeamNameFromScoreboardLine(line, nums.placement).trim();
    if (inferred.length < 2) {
      unmatchedLines.push({
        sourceLine: line,
        reason: "Could not read a team name from this line",
      });
      used.add(i);
      continue;
    }

    const inferNorm = normalizeOcrToken(inferred);

    const recoveryTeam = teams.find(
      (tm) => !consumedTeams.has(tm.id) && normalizeOcrToken(tm.name) === inferNorm,
    );
    if (recoveryTeam) {
      used.add(i);
      consumedTeams.add(recoveryTeam.id);
      matched.push({
        teamId: recoveryTeam.id,
        teamName: recoveryTeam.name,
        placement: nums.placement,
        kills: nums.kills,
        sourceLine: line,
      });
      continue;
    }

    const dupOfConsumed = teams.find(
      (tm) => consumedTeams.has(tm.id) && normalizeOcrToken(tm.name) === inferNorm,
    );
    if (dupOfConsumed) {
      used.add(i);
      unmatchedLines.push({
        sourceLine: line,
        reason: `Extra row for “${dupOfConsumed.name}” (already filled from another line)`,
      });
      continue;
    }

    newTeamByNorm.set(inferNorm, {
      inferredName: inferred,
      placement: nums.placement,
      kills: nums.kills,
      sourceLine: line,
    });
    used.add(i);
  }

  return { matched, newTeams: [...newTeamByNorm.values()], unmatchedLines };
}

/** When a roster exists, split team elims across players (remainder to earlier roster slots). */
export function distributeKillsEvenly(players: Player[], totalKills: number): Record<string, number> {
  const n = players.length;
  if (n === 0) return {};
  const k = Math.max(0, Math.min(200, Math.floor(totalKills)));
  const base = Math.floor(k / n);
  let rem = k - base * n;
  const pk: Record<string, number> = {};
  for (const p of players) {
    pk[p.id] = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
  }
  return pk;
}
