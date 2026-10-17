import { useMemo, useState } from "react";
import { useTournament } from "../state/TournamentContext";
import type { Match, Team } from "../types/tournament";
import { matchPointsForTeam } from "../lib/scoring";
import { stageSlice } from "../lib/stages";
import { effectiveTeamKills } from "../lib/matchResultKills";
import { TeamAvatar } from "./TeamAvatar";

function teamHasPlacementInAnyMatch(teamId: string, matches: Match[]): boolean {
  return matches.some((m) => {
    const p = m.results[teamId]?.placement;
    return p !== null && p !== undefined;
  });
}

function placeFieldPlaceholder(
  teamId: string,
  matches: Match[],
  placement: number | null,
): string {
  if (placement !== null) return "—";
  if (!teamHasPlacementInAnyMatch(teamId, matches)) return "-";
  return "Place";
}

function NumberField({
  value,
  blankWhenZero = false,
  disabled,
  className,
  ariaLabel,
  title,
  placeholder,
  onValue,
}: {
  value: number | null;
  /** Show 0 as an empty box so the next digits are not stuck behind a zero. */
  blankWhenZero?: boolean;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
  title?: string;
  placeholder?: string;
  onValue: (n: number | null) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const stored = value == null || (blankWhenZero && value === 0) ? "" : String(value);

  return (
    <input
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      placeholder={placeholder}
      inputMode="numeric"
      className={className}
      value={draft ?? stored}
      onFocus={(e) => {
        setDraft(stored);
        e.currentTarget.select();
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d]/g, "");
        setDraft(raw);
        if (raw === "") {
          onValue(null);
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n)) onValue(n);
      }}
      onBlur={() => setDraft(null)}
    />
  );
}

function useTeamRows(teams: Team[], teamSearch: string) {
  return useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.tag?.toLowerCase().includes(q) ?? false),
    );
  }, [teams, teamSearch]);
}

export function MatchEntryGrid({ match, teamSearch = "" }: { match: Match; teamSearch?: string }) {
  const { tournament } = useTournament();
  const slice = stageSlice(tournament);
  const teams = useTeamRows(slice.teams, teamSearch);

  if (slice.teams.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-canvas-overlay p-4 text-sm text-slate-400">
        {slice.active
          ? `Add teams to ${slice.active.name} on the Groups tab before entering results.`
          : "Add at least one team on the Teams tab to start entering lobby results."}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-canvas-overlay p-4 text-sm text-slate-400">
        No teams match &ldquo;{teamSearch.trim()}&rdquo;. Clear the search or try another name or tag.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas-overlay shadow-panel">
      <div className="flex flex-col gap-3 p-3 md:hidden">
        {teams.map((team) => (
          <TeamMatchCard key={team.id} team={team} match={match} allMatches={slice.matches} />
        ))}
      </div>
      <div className="hidden overflow-x-auto px-2 pb-2 pt-1 md:block sm:px-3 sm:pb-3">
        <table className="w-full min-w-[720px] border-separate border-spacing-x-0 border-spacing-y-3 text-sm">
          <colgroup>
            <col className="min-w-[220px] w-[38%]" />
            <col className="w-28" />
            <col className="min-w-[100px]" />
            <col className="w-32" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-canvas-raised/70 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="min-w-[220px] py-2 pl-5 pr-4 font-medium sm:pl-6 sm:pr-5">Team</th>
              <th className="w-28 py-2 px-2 text-center font-medium sm:px-3">Place</th>
              <th className="min-w-[140px] py-2 px-2 text-center font-medium sm:px-3">Elims</th>
              <th className="w-32 py-2 px-2 text-center font-medium sm:px-3">Total pts</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:bg-canvas/40">
            {teams.map((team) => (
              <TeamMatchTableRow
                key={team.id}
                team={team}
                match={match}
                allMatches={slice.matches}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamMatchCard({
  team,
  match,
  allMatches,
}: {
  team: Team;
  match: Match;
  allMatches: Match[];
}) {
  const { dispatch } = useTournament();
  const r = match.results[team.id] ?? { placement: null, kills: 0 };
  const roster = team.players ?? [];
  const elimTotal = effectiveTeamKills(team, r);
  const { total } = matchPointsForTeam(r.placement, elimTotal);
  const dnp = r.placement === null;
  const pk = r.playerKills ?? {};
  const placePlaceholder = placeFieldPlaceholder(team.id, allMatches, r.placement);
  const showHashPlace = dnp && !teamHasPlacementInAnyMatch(team.id, allMatches);

  const inputClass =
    "w-14 shrink-0 rounded-md border border-line bg-canvas px-1.5 py-1.5 text-center text-sm font-mono tabular-nums text-slate-100";

  return (
    <article className="rounded-lg border border-line/60 bg-canvas/40 px-2 py-2 sm:px-3 sm:py-2.5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="flex min-w-[132px] flex-1 items-center gap-3 pr-1 sm:min-w-[160px] sm:pr-2">
          <TeamAvatar team={team} size="md" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-sm font-medium leading-snug text-slate-100">
              {team.name}
            </div>
            {team.tag && (
              <div className="mt-0.5 truncate text-xs text-slate-500">{team.tag}</div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <label className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
          <span className="w-7 text-right">Pl</span>
          <NumberField
            ariaLabel={`${team.name} placement`}
            className={`${inputClass}${showHashPlace ? " placeholder:text-slate-400" : ""}`}
            value={r.placement}
            placeholder={placePlaceholder}
            title={showHashPlace ? "No placement in any match yet" : undefined}
            onValue={(n) =>
              dispatch({
                type: "setMatchResult",
                matchId: match.id,
                teamId: team.id,
                patch: { placement: n },
              })
            }
          />
        </label>
        <label className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
          <span className="w-7 text-right">K</span>
          {roster.length === 0 ? (
            <NumberField
              disabled={dnp}
              blankWhenZero
              ariaLabel={`${team.name} kills`}
              className={`${inputClass} disabled:opacity-40`}
              value={dnp ? null : r.kills}
              onValue={(n) =>
                dispatch({
                  type: "setMatchResult",
                  matchId: match.id,
                  teamId: team.id,
                  patch: { kills: n ?? 0 },
                })
              }
            />
          ) : (
            <span
              className="flex w-14 shrink-0 items-center justify-center rounded-md border border-line/50 bg-canvas/60 py-1.5 font-mono text-sm tabular-nums text-slate-200"
              title="Sum of player elims"
            >
              {dnp ? "—" : elimTotal}
            </span>
          )}
        </label>
        <div className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
          <span className="w-7 text-right">Pts</span>
          <span className="flex w-14 items-center justify-center font-mono text-sm tabular-nums text-accent">
            {dnp ? "—" : total}
          </span>
        </div>
        </div>
      </div>
      {roster.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-line/60 pt-3">
          {roster.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-slate-400">{p.name}</span>
              <NumberField
                disabled={dnp}
                blankWhenZero
                ariaLabel={`${team.name} ${p.name} elims`}
                className="w-16 shrink-0 rounded border border-line bg-canvas px-2 py-1.5 text-center font-mono tabular-nums text-slate-100 disabled:opacity-40"
                value={dnp ? null : (pk[p.id] ?? 0)}
                onValue={(n) =>
                  dispatch({
                    type: "setMatchPlayerKills",
                    matchId: match.id,
                    teamId: team.id,
                    playerId: p.id,
                    kills: n ?? 0,
                  })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function TeamMatchTableRow({
  team,
  match,
  allMatches,
}: {
  team: Team;
  match: Match;
  allMatches: Match[];
}) {
  const { dispatch } = useTournament();
  const r = match.results[team.id] ?? { placement: null, kills: 0 };
  const roster = team.players ?? [];
  const elimTotal = effectiveTeamKills(team, r);
  const { total } = matchPointsForTeam(r.placement, elimTotal);
  const dnp = r.placement === null;
  const pk = r.playerKills ?? {};
  const placePlaceholder = placeFieldPlaceholder(team.id, allMatches, r.placement);
  const showHashPlace = dnp && !teamHasPlacementInAnyMatch(team.id, allMatches);

  return (
    <tr className="hover:bg-canvas-raised/30 [&>td]:border-y [&>td]:border-line/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
      <td className="min-w-[220px] align-middle py-3 pl-5 pr-4 sm:py-4 sm:pl-6 sm:pr-5">
        <div className="flex min-w-0 items-center gap-3 text-left">
          <TeamAvatar team={team} size="md" className="shrink-0" />
          <div className="min-w-0 flex-1 text-left">
            <div className="font-medium leading-snug text-slate-100">{team.name}</div>
            {team.tag && <div className="mt-0.5 truncate text-xs text-slate-500">{team.tag}</div>}
            {roster.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5 border-t border-line/60 pt-2">
                {roster.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="w-[100px] shrink-0 truncate text-slate-400">{p.name}</span>
                    <NumberField
                      disabled={dnp}
                      blankWhenZero
                      ariaLabel={`${team.name} ${p.name} elims`}
                      className="w-16 rounded border border-line bg-canvas px-1.5 py-1 text-left font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      value={dnp ? null : (pk[p.id] ?? 0)}
                      onValue={(n) =>
                        dispatch({
                          type: "setMatchPlayerKills",
                          matchId: match.id,
                          teamId: team.id,
                          playerId: p.id,
                          kills: n ?? 0,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="align-middle py-3 px-2 text-center sm:py-4 sm:px-3">
        <NumberField
          ariaLabel={`${team.name} placement`}
          title={
            showHashPlace
              ? "No placement in any match yet — enter a place for this map"
              : dnp
                ? "Enter placement to count this lobby (clear to skip team for this round)"
                : undefined
          }
          className={`mx-auto w-full max-w-[5rem] rounded-md border border-line bg-canvas px-2 py-1.5 text-center font-mono tabular-nums text-slate-100${showHashPlace ? " placeholder:text-slate-400" : ""}`}
          value={r.placement}
          placeholder={placePlaceholder}
          onValue={(n) =>
            dispatch({
              type: "setMatchResult",
              matchId: match.id,
              teamId: team.id,
              patch: { placement: n },
            })
          }
        />
      </td>
      <td className="align-middle py-3 px-2 text-center sm:py-4 sm:px-3">
        {roster.length === 0 ? (
          <NumberField
            disabled={dnp}
            blankWhenZero
            ariaLabel={`${team.name} kills`}
            className="mx-auto w-full max-w-[100px] rounded-md border border-line bg-canvas px-2 py-1.5 text-center font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            value={dnp ? null : r.kills}
            onValue={(n) =>
              dispatch({
                type: "setMatchResult",
                matchId: match.id,
                teamId: team.id,
                patch: { kills: n ?? 0 },
              })
            }
          />
        ) : (
          <div className="text-center font-mono text-sm tabular-nums text-slate-200">
            <span className="text-slate-500">Σ</span> {dnp ? "—" : elimTotal}
          </div>
        )}
      </td>
      <td className="align-middle py-3 px-2 text-center font-mono tabular-nums text-accent sm:py-4 sm:px-3">
        {dnp ? "—" : total}
      </td>
    </tr>
  );
}
