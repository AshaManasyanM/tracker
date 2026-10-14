import { useState } from "react";
import { useTournament } from "../state/TournamentContext";
import {
  finalsStage,
  groupStages,
  matchesInStage,
  teamsInStage,
  unassignedTeams,
} from "../lib/stages";
import type { TournamentStage } from "../types/tournament";
import { Leaderboard } from "./Leaderboard";
import { FinalResultsModal } from "./FinalResultsModal";

export function GroupsPanel() {
  const { tournament, dispatch } = useTournament();
  const [groupName, setGroupName] = useState("");
  const [exportStageId, setExportStageId] = useState<string | null>(null);
  const groups = groupStages(tournament);
  const finals = finalsStage(tournament);
  const waiting = unassignedTeams(tournament);
  const looseMatches = tournament.matches.filter((m) => !m.stageId);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-canvas-overlay p-4 shadow-panel">
        <h2 className="text-base font-semibold text-slate-100">Groups</h2>
        <p className="mt-1 text-xs text-slate-500">
          Each group has its own squads, matches, and standings. Qualifiers move to the finals
          with a fresh score of zero. Group results stay where they are.
        </p>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "addGroup", name: groupName });
            setGroupName("");
          }}
        >
          <label className="flex-1 text-xs text-slate-400">
            Group name
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={40}
              placeholder="Group A"
              className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-2 text-sm text-slate-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-md border border-accent/35 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-glow hover:bg-accent/15"
          >
            Add group
          </button>
        </form>
      </section>

      {looseMatches.length > 0 && groups.length > 0 && (
        <LooseMatches count={looseMatches.length} stages={groups} />
      )}

      {waiting.length > 0 && groups.length > 0 && (
        <section className="rounded-xl border border-line bg-canvas-overlay p-4">
          <h3 className="text-sm font-semibold text-slate-100">Not in a group</h3>
          <p className="mt-1 text-xs text-slate-500">
            {waiting.length} squad{waiting.length === 1 ? "" : "s"} still need a group.
          </p>
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
            {waiting.map((team) => (
              <li key={team.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span className="text-sm text-slate-100">{team.name}</span>
                <label className="text-xs text-slate-400">
                  <span className="sr-only">Assign {team.name}</span>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const stageId = e.target.value;
                      e.target.value = "";
                      if (!stageId) return;
                      dispatch({ type: "assignTeamToGroup", teamId: team.id, stageId });
                    }}
                    className="rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100"
                  >
                    <option value="">Assign to…</option>
                    {groups.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {groups.map((stage) => (
        <GroupCard
          key={stage.id}
          stage={stage}
          onExport={() => setExportStageId(stage.id)}
        />
      ))}

      {finals && <FinalsCard stage={finals} onExport={() => setExportStageId(finals.id)} />}

      <FinalResultsModal
        open={exportStageId != null}
        onClose={() => setExportStageId(null)}
        tournament={tournament}
        stageId={exportStageId}
      />
    </div>
  );
}

function LooseMatches({ count, stages }: { count: number; stages: TournamentStage[] }) {
  const { dispatch } = useTournament();
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");

  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
      <h3 className="text-sm font-semibold text-amber-50">Matches not in a group</h3>
      <p className="mt-1 text-xs text-amber-100/80">
        {count} existing match{count === 1 ? "" : "es"} predate groups. Move them into one group
        to keep those points on that table only.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={stageId}
          onChange={(e) => setStageId(e.target.value)}
          className="rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100"
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!stageId}
          className="rounded-md border border-amber-500/40 px-3 py-1.5 text-sm text-amber-50 hover:bg-amber-500/10 disabled:opacity-40"
          onClick={() => dispatch({ type: "assignMatchesToStage", stageId })}
        >
          Move matches
        </button>
      </div>
    </section>
  );
}

function GroupCard({ stage, onExport }: { stage: TournamentStage; onExport: () => void }) {
  const { tournament, dispatch } = useTournament();
  const [draft, setDraft] = useState(stage.name);
  const [picked, setPicked] = useState<string[]>([]);
  const teams = teamsInStage(tournament, stage);
  const matches = matchesInStage(tournament, stage);
  const finals = finalsStage(tournament);
  const finalistIds = new Set(finals?.teamIds ?? []);
  const available = unassignedTeams(tournament);

  const toggle = (teamId: string) => {
    setPicked((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  return (
    <section className="rounded-xl border border-line bg-canvas-overlay p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="min-w-[12rem] flex-1 text-xs text-slate-400">
          Group name
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const name = draft.trim();
              if (!name || name === stage.name) {
                setDraft(stage.name);
                return;
              }
              dispatch({ type: "renameStage", stageId: stage.id, name });
            }}
            className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5 text-sm font-medium text-slate-100"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border border-[#c9a227]/40 px-3 py-1.5 text-sm text-[#f5e6b8] hover:bg-[#2a2312]"
            onClick={onExport}
          >
            Export standings
          </button>
          <button
            type="button"
            className="rounded-md border border-danger/30 px-3 py-1.5 text-sm text-danger hover:bg-danger/10"
            onClick={() => {
              if (
                !confirm(
                  `Remove ${stage.name}? Its matches and points are deleted. Teams stay in the tournament.`,
                )
              )
                return;
              dispatch({ type: "removeGroup", stageId: stage.id });
            }}
          >
            Remove group
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Teams</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              defaultValue=""
              disabled={available.length === 0}
              onChange={(e) => {
                const teamId = e.target.value;
                e.target.value = "";
                if (!teamId) return;
                dispatch({ type: "assignTeamToGroup", teamId, stageId: stage.id });
              }}
              className="min-w-[10rem] flex-1 rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100 disabled:opacity-50"
            >
              <option value="">{available.length === 0 ? "All squads are assigned" : "Add a squad…"}</option>
              {available.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {teams.length === 0 && (
              <li className="px-3 py-4 text-sm text-slate-500">No teams in this group yet.</li>
            )}
            {teams.map((team) => (
              <li key={team.id} className="flex items-center gap-2 px-3 py-2">
                <input
                  type="checkbox"
                  checked={picked.includes(team.id)}
                  onChange={() => toggle(team.id)}
                  aria-label={`Qualify ${team.name}`}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{team.name}</span>
                {finalistIds.has(team.id) && (
                  <span className="shrink-0 rounded-full border border-[#c9a227]/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#f5e6b8]">
                    Finalist
                  </span>
                )}
                <button
                  type="button"
                  className="shrink-0 text-xs text-slate-500 hover:text-danger"
                  onClick={() =>
                    dispatch({ type: "assignTeamToGroup", teamId: team.id, stageId: null })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={picked.length === 0}
            className="mt-2 rounded-md border border-[#c9a227]/40 bg-[#2a2312]/80 px-3 py-1.5 text-sm font-medium text-[#f5e6b8] hover:bg-[#3a3018] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              dispatch({ type: "qualifyTeams", teamIds: picked });
              setPicked([]);
            }}
          >
            Move selected to finals
          </button>
        </div>
        <Leaderboard teams={teams} matches={matches} title={`${stage.name} results`} />
      </div>
    </section>
  );
}

function FinalsCard({ stage, onExport }: { stage: TournamentStage; onExport: () => void }) {
  const { tournament, dispatch } = useTournament();
  const [draft, setDraft] = useState(stage.name);
  const teams = teamsInStage(tournament, stage);
  const matches = matchesInStage(tournament, stage);

  return (
    <section className="rounded-xl border border-[#c9a227]/35 bg-canvas-overlay p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[12rem] flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#c9a227]">Finals</p>
          <label className="mt-1 block text-xs text-slate-400">
            Name
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                const name = draft.trim();
                if (!name || name === stage.name) {
                  setDraft(stage.name);
                  return;
                }
                dispatch({ type: "renameStage", stageId: stage.id, name });
              }}
              className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-1.5 text-sm font-medium text-slate-100"
            />
          </label>
        </div>
        <button
          type="button"
          className="rounded-md border border-[#c9a227]/40 px-3 py-1.5 text-sm text-[#f5e6b8] hover:bg-[#2a2312]"
          onClick={onExport}
        >
          Export final standings
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Final points start at zero. Enter final lobbies from the Live tab while Finals is selected.
        Group scores are not carried over.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Finalists</h3>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {teams.length === 0 && (
              <li className="px-3 py-4 text-sm text-slate-500">
                Select teams in a group and move them here.
              </li>
            )}
            {teams.map((team) => (
              <li key={team.id} className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="min-w-0 truncate text-sm text-slate-100">{team.name}</span>
                <button
                  type="button"
                  className="shrink-0 text-xs text-slate-500 hover:text-danger"
                  onClick={() => dispatch({ type: "removeFinalist", teamId: team.id })}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Leaderboard teams={teams} matches={matches} title={`${stage.name} results`} />
      </div>
    </section>
  );
}
