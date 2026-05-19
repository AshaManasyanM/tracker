import { useMemo } from "react";
import { useTournament } from "../state/TournamentContext";
import type { Match, Team } from "../types/tournament";
import { matchPointsForTeam } from "../lib/scoring";
import { effectiveTeamKills } from "../lib/matchResultKills";
import { TeamAvatar } from "./TeamAvatar";

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
  const teams = useTeamRows(tournament.teams, teamSearch);

  if (tournament.teams.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-canvas-overlay p-4 text-sm text-slate-400">
        Add at least one team on the Teams tab to start entering lobby results.
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
          <TeamMatchCard key={team.id} team={team} match={match} />
        ))}
      </div>
      <div className="hidden overflow-x-auto px-2 pb-2 pt-1 md:block sm:px-3 sm:pb-3">
        <table className="w-full min-w-[640px] border-separate border-spacing-x-0 border-spacing-y-3 text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas-raised/70 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pl-4 pr-2 font-medium sm:pl-5 sm:pr-3">Team</th>
              <th className="w-28 py-2 px-2 text-center font-medium sm:px-3">Place</th>
              <th className="min-w-[140px] py-2 px-2 text-center font-medium sm:px-3">Elims</th>
              <th className="w-32 py-2 px-2 text-center font-medium sm:px-3">Total pts</th>
            </tr>
          </thead>
          <tbody className="[&_tr]:bg-canvas/40">
            {teams.map((team) => (
              <TeamMatchTableRow key={team.id} team={team} match={match} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamMatchCard({ team, match }: { team: Team; match: Match }) {
  const { dispatch } = useTournament();
  const r = match.results[team.id] ?? { placement: null, kills: 0 };
  const roster = team.players ?? [];
  const elimTotal = effectiveTeamKills(team, r);
  const { total } = matchPointsForTeam(r.placement, elimTotal);
  const dnp = r.placement === null;
  const pk = r.playerKills ?? {};

  return (
    <article className="rounded-lg border border-line/60 bg-canvas/40 p-3">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <TeamAvatar team={team} size="sm" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-slate-100">{team.name}</div>
          {team.tag && <div className="truncate text-xs text-slate-500">{team.tag}</div>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <label className="flex flex-col gap-1 text-slate-500">
          Place
          <input
            aria-label={`${team.name} placement`}
            inputMode="numeric"
            className="w-full rounded-md border border-line bg-canvas px-2 py-2 text-center font-mono tabular-nums text-slate-100"
            value={dnp ? "" : String(r.placement ?? "")}
            placeholder="—"
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === "") {
                dispatch({
                  type: "setMatchResult",
                  matchId: match.id,
                  teamId: team.id,
                  patch: { placement: null },
                });
                return;
              }
              const n = Number(raw);
              if (!Number.isFinite(n)) return;
              dispatch({
                type: "setMatchResult",
                matchId: match.id,
                teamId: team.id,
                patch: { placement: n },
              });
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-slate-500">
          Elims
          {roster.length === 0 ? (
            <input
              disabled={dnp}
              aria-label={`${team.name} kills`}
              inputMode="numeric"
              className="w-full rounded-md border border-line bg-canvas px-2 py-2 text-center font-mono tabular-nums text-slate-100 disabled:opacity-40"
              value={dnp ? "" : String(r.kills)}
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (raw === "") {
                  dispatch({
                    type: "setMatchResult",
                    matchId: match.id,
                    teamId: team.id,
                    patch: { kills: 0 },
                  });
                  return;
                }
                const n = Number(raw);
                if (!Number.isFinite(n)) return;
                dispatch({
                  type: "setMatchResult",
                  matchId: match.id,
                  teamId: team.id,
                  patch: { kills: n },
                });
              }}
            />
          ) : (
            <div className="flex h-[42px] items-center justify-center rounded-md border border-line/50 bg-canvas/60 font-mono text-sm tabular-nums text-slate-200">
              {dnp ? "—" : elimTotal}
            </div>
          )}
        </label>
        <div className="flex flex-col gap-1 text-slate-500">
          Total pts
          <div className="flex h-[42px] items-center justify-center font-mono text-lg tabular-nums text-accent">
            {dnp ? "—" : total}
          </div>
        </div>
      </div>
      {roster.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-line/60 pt-3">
          {roster.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-slate-400">{p.name}</span>
              <input
                disabled={dnp}
                aria-label={`${team.name} ${p.name} elims`}
                inputMode="numeric"
                className="w-16 shrink-0 rounded border border-line bg-canvas px-2 py-1.5 text-center font-mono tabular-nums text-slate-100 disabled:opacity-40"
                value={dnp ? "" : String(pk[p.id] ?? 0)}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  const n = raw === "" ? 0 : Number(raw);
                  if (!Number.isFinite(n)) return;
                  dispatch({
                    type: "setMatchPlayerKills",
                    matchId: match.id,
                    teamId: team.id,
                    playerId: p.id,
                    kills: n,
                  });
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function TeamMatchTableRow({ team, match }: { team: Team; match: Match }) {
  const { dispatch } = useTournament();
  const r = match.results[team.id] ?? { placement: null, kills: 0 };
  const roster = team.players ?? [];
  const elimTotal = effectiveTeamKills(team, r);
  const { total } = matchPointsForTeam(r.placement, elimTotal);
  const dnp = r.placement === null;
  const pk = r.playerKills ?? {};

  return (
    <tr className="hover:bg-canvas-raised/30 [&>td]:border-y [&>td]:border-line/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
      <td className="align-middle py-3 pl-4 pr-2 sm:py-4 sm:pl-5 sm:pr-3">
        <div className="flex min-w-0 items-center gap-2 text-left">
          <TeamAvatar team={team} size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate font-medium text-slate-100">{team.name}</div>
            {team.tag && <div className="truncate text-xs text-slate-500">{team.tag}</div>}
            {roster.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5 border-t border-line/60 pt-2">
                {roster.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="w-[100px] shrink-0 truncate text-slate-400">{p.name}</span>
                    <input
                      disabled={dnp}
                      aria-label={`${team.name} ${p.name} elims`}
                      inputMode="numeric"
                      className="w-16 rounded border border-line bg-canvas px-1.5 py-1 text-left font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      value={dnp ? "" : String(pk[p.id] ?? 0)}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        const n = raw === "" ? 0 : Number(raw);
                        if (!Number.isFinite(n)) return;
                        dispatch({
                          type: "setMatchPlayerKills",
                          matchId: match.id,
                          teamId: team.id,
                          playerId: p.id,
                          kills: n,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="align-middle py-3 px-2 text-center sm:py-4 sm:px-3">
        <input
          aria-label={`${team.name} placement`}
          title={
            dnp
              ? "Enter placement to count this lobby (clear to skip team for this round)"
              : undefined
          }
          inputMode="numeric"
          className="mx-auto w-full max-w-[5rem] rounded-md border border-line bg-canvas px-2 py-1.5 text-center font-mono tabular-nums text-slate-100"
          value={dnp ? "" : String(r.placement ?? "")}
          placeholder={dnp ? "Place" : "—"}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") {
              dispatch({
                type: "setMatchResult",
                matchId: match.id,
                teamId: team.id,
                patch: { placement: null },
              });
              return;
            }
            const n = Number(raw);
            if (!Number.isFinite(n)) return;
            dispatch({
              type: "setMatchResult",
              matchId: match.id,
              teamId: team.id,
              patch: { placement: n },
            });
          }}
        />
      </td>
      <td className="align-middle py-3 px-2 text-center sm:py-4 sm:px-3">
        {roster.length === 0 ? (
          <input
            disabled={dnp}
            aria-label={`${team.name} kills`}
            inputMode="numeric"
            className="mx-auto w-full max-w-[100px] rounded-md border border-line bg-canvas px-2 py-1.5 text-center font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            value={dnp ? "" : String(r.kills)}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === "") {
                dispatch({
                  type: "setMatchResult",
                  matchId: match.id,
                  teamId: team.id,
                  patch: { kills: 0 },
                });
                return;
              }
              const n = Number(raw);
              if (!Number.isFinite(n)) return;
              dispatch({
                type: "setMatchResult",
                matchId: match.id,
                teamId: team.id,
                patch: { kills: n },
              });
            }}
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
