import { useTournament } from "../state/TournamentContext";
import type { Match } from "../types/tournament";
import { matchPointsForTeam } from "../lib/scoring";
import { effectiveTeamKills } from "../lib/matchResultKills";
import { TeamAvatar } from "./TeamAvatar";

export function MatchEntryGrid({ match }: { match: Match }) {
  const { tournament, dispatch } = useTournament();

  if (tournament.teams.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-canvas-overlay p-4 text-sm text-slate-400">
        Add at least one team on the Teams tab to start entering lobby results.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-canvas-overlay shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas-raised/70 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium sm:px-3">Team</th>
              <th className="w-20 px-2 py-2 font-medium sm:px-3" title="Did not play this lobby">
                Out
              </th>
              <th className="w-28 px-2 py-2 font-medium sm:px-3">Place</th>
              <th className="min-w-[140px] px-2 py-2 font-medium sm:px-3">Elims</th>
              <th className="w-32 px-2 py-2 text-right font-medium sm:px-3">Pts</th>
            </tr>
          </thead>
          <tbody>
            {tournament.teams.map((team) => {
              const r = match.results[team.id] ?? { placement: null, kills: 0 };
              const roster = team.players ?? [];
              const elimTotal = effectiveTeamKills(team, r);
              const { total } = matchPointsForTeam(r.placement, elimTotal);
              const dnp = r.placement === null;
              const pk = r.playerKills ?? {};

              return (
                <tr key={team.id} className="border-b border-line/70 hover:bg-canvas-raised/30">
                  <td className="px-2 py-1.5 sm:px-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <TeamAvatar team={team} size="sm" className="mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-100">{team.name}</div>
                        {team.tag && (
                          <div className="truncate text-xs text-slate-500">{team.tag}</div>
                        )}
                        {roster.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1.5 border-t border-line/60 pt-2">
                            {roster.map((p) => (
                              <div key={p.id} className="flex items-center gap-2 text-xs">
                                <span className="w-[100px] shrink-0 truncate text-slate-400">
                                  {p.name}
                                </span>
                                <input
                                  disabled={dnp}
                                  aria-label={`${team.name} ${p.name} elims`}
                                  inputMode="numeric"
                                  className="w-16 rounded border border-line bg-canvas px-1.5 py-1 font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                  <td className="px-2 py-1.5 align-top sm:px-3">
                    <input
                      type="checkbox"
                      aria-label={`${team.name} sat out`}
                      checked={dnp}
                      onChange={(e) => {
                        const satOut = e.target.checked;
                        dispatch({
                          type: "setMatchResult",
                          matchId: match.id,
                          teamId: team.id,
                          patch: satOut
                            ? { placement: null, kills: 0 }
                            : { placement: 16, kills: r.kills },
                        });
                      }}
                      className="mt-1 h-4 w-4 accent-accent"
                    />
                  </td>
                  <td className="px-2 py-1.5 align-top sm:px-3">
                    <input
                      disabled={dnp}
                      aria-label={`${team.name} placement`}
                      inputMode="numeric"
                      className="w-full rounded-md border border-line bg-canvas px-2 py-1.5 font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                  </td>
                  <td className="px-2 py-1.5 align-top sm:px-3">
                    {roster.length === 0 ? (
                      <input
                        disabled={dnp}
                        aria-label={`${team.name} kills`}
                        inputMode="numeric"
                        className="w-full max-w-[100px] rounded-md border border-line bg-canvas px-2 py-1.5 font-mono tabular-nums text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                      <div className="pt-1 font-mono text-sm tabular-nums text-slate-200">
                        <span className="text-slate-500">Σ</span> {dnp ? "—" : elimTotal}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 align-top text-right font-mono tabular-nums text-accent sm:px-3">
                    <div className="pt-1">{dnp ? "—" : total}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
