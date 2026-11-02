import { useLayoutEffect, useRef, useState } from "react";
import { useTournament } from "../state/TournamentContext";
import {
  finalsStage,
  GROUP_ADVANCE_COUNT,
  groupStages,
  lastChanceStage,
  matchesInStage,
  SEMIFINAL_ADVANCE_COUNT,
  semifieldStage,
  semifinalStages,
  teamsInStage,
  unassignedTeams,
} from "../lib/stages";
import type { TournamentStage } from "../types/tournament";
import {
  captureElementToPngBlob,
  captureVisibleGraphic,
  downloadPngBlob,
  measureGraphicExportHeight,
  slugifyFilename,
} from "../lib/graphicCapture";
import { FINAL_STAGE_EXPORT_MAX_H, SEMIFINAL_FIELD_EXPORT_W } from "../lib/graphicTheme";
import { Leaderboard } from "./Leaderboard";
import { FinalResultsModal } from "./FinalResultsModal";
import { SemifinalFieldGraphic } from "./SemifinalFieldGraphic";
import { SemifinalGroupsGraphic } from "./SemifinalGroupsGraphic";

export function GroupsPanel() {
  const { tournament, dispatch } = useTournament();
  const [groupName, setGroupName] = useState("");
  const [exportStageId, setExportStageId] = useState<string | null>(null);
  const [exportSemifinalField, setExportSemifinalField] = useState(false);
  const [exportLastChanceField, setExportLastChanceField] = useState(false);
  const [exportFinalsField, setExportFinalsField] = useState(false);
  const groups = groupStages(tournament);
  const semis = semifinalStages(tournament);
  const lastChance = lastChanceStage(tournament);
  const finals = finalsStage(tournament);
  const waiting = unassignedTeams(tournament);
  const looseMatches = tournament.matches.filter((m) => !m.stageId);
  const lastChanceTeams = lastChance ? teamsInStage(tournament, lastChance) : [];
  const finalsTeams = finals ? teamsInStage(tournament, finals) : [];
  const rosterField = exportLastChanceField && lastChance
    ? {
        teams: lastChanceTeams,
        heading: lastChance.name || "Last chance",
        emptyText: "No teams in last chance",
        fileTag: lastChance.name || "last_chance",
        label: "Last chance",
        columnsPerRow: 5,
      }
    : exportFinalsField && finals
      ? {
          teams: finalsTeams,
          heading: "Եզրափակիչ",
          emptyText: "Եզրափակիչում թիմեր չկան",
          fileTag: finals.name || "finals",
          label: "Finals",
          columnsPerRow: 5,
        }
      : null;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-line bg-canvas-overlay p-4 shadow-panel">
        <h2 className="text-base font-semibold text-slate-100">Groups</h2>
        <p className="mt-1 text-xs text-slate-500">
          Each group has its own squads, matches, and standings. Check {GROUP_ADVANCE_COUNT}{" "}
          squads and send them to the semifinal image. Then choose which of those squads play
          Semifinal A and which play Semifinal B. From each of those groups, check the{" "}
          {SEMIFINAL_ADVANCE_COUNT} who go to the final. Everyone left unchecked plays last chance.
          From last chance you can still send squads into the final. Every new stage starts at zero.
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
            These squads were taken out of a group, or were never placed in one. They are still in
            the tournament until you delete them.
          </p>
          <button
            type="button"
            className="mt-3 rounded-md border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/10"
            onClick={() => {
              if (
                !confirm(
                  `Delete ${waiting.length} squad${waiting.length === 1 ? "" : "s"} that are not in a group? Their scores are removed from the saved tournament.`,
                )
              ) {
                return;
              }
              dispatch({ type: "removeTeams", teamIds: waiting.map((team) => team.id) });
            }}
          >
            Delete all squads not in a group
          </button>
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

      {groups.length > 0 && (
        <SemifinalLiveImage onDownload={() => setExportSemifinalField(true)} />
      )}
      {groups.length > 0 && <SemifinalGroupsImages />}

      {groups.map((stage) => (
        <GroupCard
          key={stage.id}
          stage={stage}
          onExport={() => setExportStageId(stage.id)}
        />
      ))}

      {semis.map((stage) => (
        <StageRosterCard
          key={stage.id}
          stage={stage}
          kicker="Semifinal"
          borderClass="border-sky-400/35"
          kickerClass="text-sky-300"
          emptyText="Select the top 4 in a group, then send them here."
          note={`Scores start at zero. Check the top ${SEMIFINAL_ADVANCE_COUNT} in this group. They go to the final, and the ones you leave unchecked go to last chance.`}
          split
          onExport={() => setExportStageId(stage.id)}
        />
      ))}

      {lastChance && (
        <LastChanceTeamsImage onDownload={() => setExportLastChanceField(true)} />
      )}

      {lastChance && (
        <StageRosterCard
          stage={lastChance}
          kicker="Last chance"
          borderClass="border-orange-400/35"
          kickerClass="text-orange-200"
          emptyText="Teams that miss the top 6 in a semifinal group land here."
          note="Last chance points start at zero. Check squads here to send them into the final. Enter last-chance lobbies from the Live tab while Last chance is selected."
          promoteToFinal
          onExport={() => setExportStageId(lastChance.id)}
        />
      )}

      {finals && (
        <FinalsTeamsImage onDownload={() => setExportFinalsField(true)} />
      )}

      {finals && <FinalsCard stage={finals} onExport={() => setExportStageId(finals.id)} />}

      <FinalResultsModal
        open={
          exportStageId != null ||
          exportSemifinalField ||
          exportLastChanceField ||
          exportFinalsField
        }
        onClose={() => {
          setExportStageId(null);
          setExportSemifinalField(false);
          setExportLastChanceField(false);
          setExportFinalsField(false);
        }}
        tournament={tournament}
        stageId={exportStageId}
        semifinalField={exportSemifinalField}
        rosterField={rosterField}
      />
    </div>
  );
}

function SemifinalLiveImage({ onDownload }: { onDownload: () => void }) {
  const { tournament, dispatch } = useTournament();
  const graphicRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(420);
  const [picked, setPicked] = useState<string[]>([]);
  const field = semifieldStage(tournament);
  const semis = semifinalStages(tournament);
  const teams = field ? teamsInStage(tournament, field) : [];
  const sideName = (teamId: string) => semis.find((stage) => stage.teamIds.includes(teamId))?.name;
  const scale = 0.48;
  const previewW = SEMIFINAL_FIELD_EXPORT_W * scale;

  useLayoutEffect(() => {
    const el = graphicRef.current;
    if (!el) return;
    const measure = () => setHeight(Math.ceil(el.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [teams.length]);

  const toggle = (teamId: string) => {
    setPicked((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  const send = (slot: 0 | 1) => {
    dispatch({ type: "assignSemifinalSide", teamIds: picked, slot });
    setPicked([]);
  };

  return (
    <section className="rounded-xl border border-sky-400/30 bg-canvas-overlay p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Semifinal</h2>
          <p className="mt-1 text-xs text-slate-500">
            Every squad you send from a group appears here with its logo and name. Then choose
            Semifinal A or Semifinal B.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 hover:bg-sky-400/15"
          onClick={onDownload}
        >
          Download image
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black">
        <div className="mx-auto" style={{ width: previewW, height: height * scale }}>
          <div
            className="origin-top-left"
            style={{ width: SEMIFINAL_FIELD_EXPORT_W, transform: `scale(${scale})` }}
          >
            <SemifinalFieldGraphic ref={graphicRef} tournamentName={tournament.name} teams={teams} />
          </div>
        </div>
      </div>
      {teams.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-100">Send to a semifinal group</h3>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {teams.map((team) => (
              <li key={team.id} className="flex items-center gap-2 px-3 py-2">
                <input
                  type="checkbox"
                  checked={picked.includes(team.id)}
                  onChange={() => toggle(team.id)}
                  aria-label={`Choose a semifinal group for ${team.name}`}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{team.name}</span>
                {sideName(team.id) && (
                  <span className="shrink-0 rounded-full border border-sky-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-100">
                    {sideName(team.id)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={picked.length === 0}
              className="rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-sm font-medium text-sky-100 hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => send(0)}
            >
              Send selected to {semis[0]?.name ?? "Semifinal A"}
            </button>
            <button
              type="button"
              disabled={picked.length === 0}
              className="rounded-md border border-sky-400/40 px-3 py-1.5 text-sm font-medium text-sky-100 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => send(1)}
            >
              Send selected to {semis[1]?.name ?? "Semifinal B"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function LastChanceTeamsImage({ onDownload }: { onDownload: () => void }) {
  const { tournament } = useTournament();
  const graphicRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(420);
  const stage = lastChanceStage(tournament);
  const teams = stage ? teamsInStage(tournament, stage) : [];
  const scale = 0.48;
  const previewW = SEMIFINAL_FIELD_EXPORT_W * scale;

  useLayoutEffect(() => {
    const el = graphicRef.current;
    if (!el) return;
    const measure = () => setHeight(Math.ceil(el.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [teams.length, stage?.name]);

  if (!stage) return null;

  return (
    <section className="rounded-xl border border-orange-400/30 bg-canvas-overlay p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Last chance</h2>
          <p className="mt-1 text-xs text-slate-500">
            Same logo poster as the semifinal. Squad list, standings, and scores stay below.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-orange-400/40 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-100 hover:bg-orange-400/15"
          onClick={onDownload}
        >
          Download image
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black">
        <div className="mx-auto" style={{ width: previewW, height: height * scale }}>
          <div
            className="origin-top-left"
            style={{ width: SEMIFINAL_FIELD_EXPORT_W, transform: `scale(${scale})` }}
          >
            <SemifinalFieldGraphic
              ref={graphicRef}
              tournamentName={tournament.name}
              teams={teams}
              heading={stage.name || "Last chance"}
              emptyText="No teams in last chance"
              columnsPerRow={5}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalsTeamsImage({ onDownload }: { onDownload: () => void }) {
  const { tournament } = useTournament();
  const graphicRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(420);
  const stage = finalsStage(tournament);
  const teams = stage ? teamsInStage(tournament, stage) : [];
  const scale = 0.48;
  const previewW = SEMIFINAL_FIELD_EXPORT_W * scale;

  useLayoutEffect(() => {
    const el = graphicRef.current;
    if (!el) return;
    const measure = () => setHeight(Math.ceil(el.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [teams.length, stage?.name]);

  if (!stage) return null;

  return (
    <section className="rounded-xl border border-[#c9a227]/30 bg-canvas-overlay p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Finals</h2>
          <p className="mt-1 text-xs text-slate-500">
            Logo poster like the semifinal field. Squad list, standings, and scores stay below.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-[#c9a227]/40 bg-[#2a2312]/80 px-4 py-2 text-sm font-medium text-[#f5e6b8] hover:bg-[#3a3018]"
          onClick={onDownload}
        >
          Download image
        </button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black">
        <div className="mx-auto" style={{ width: previewW, height: height * scale }}>
          <div
            className="origin-top-left"
            style={{ width: SEMIFINAL_FIELD_EXPORT_W, transform: `scale(${scale})` }}
          >
            <SemifinalFieldGraphic
              ref={graphicRef}
              tournamentName={tournament.name}
              teams={teams}
              heading="Եզրափակիչ"
              emptyText="Եզրափակիչում թիմեր չկան"
              columnsPerRow={5}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SemifinalGroupsImages() {
  const { tournament } = useTournament();
  const bothRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(480);
  const [busy, setBusy] = useState<string | null>(null);
  const semis = semifinalStages(tournament);
  const columns = semis.map((stage) => ({
    id: stage.id,
    name: stage.name,
    teams: teamsInStage(tournament, stage),
  }));
  const named = [
    columns[0] ?? { id: "semifinal-a", name: "Semifinal A", teams: [] },
    columns[1] ?? { id: "semifinal-b", name: "Semifinal B", teams: [] },
  ];
  const hasTeams = named.some((column) => column.teams.length > 0);
  const scale = 0.82;
  const previewW = SEMIFINAL_FIELD_EXPORT_W * scale;

  useLayoutEffect(() => {
    const el = bothRef.current;
    if (!el) return;
    const measure = () => setHeight(Math.ceil(el.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [named[0]?.teams.length, named[1]?.teams.length]);

  if (!hasTeams) return null;

  const save = async (el: HTMLElement | null, label: string, scaled: boolean) => {
    if (!el || busy) return;
    setBusy(label);
    try {
      const exportH = measureGraphicExportHeight(el, FINAL_STAGE_EXPORT_MAX_H);
      const blob = scaled
        ? await captureVisibleGraphic(el, SEMIFINAL_FIELD_EXPORT_W, exportH)
        : await captureElementToPngBlob(el, SEMIFINAL_FIELD_EXPORT_W, exportH);
      const stamp = new Date().toISOString().slice(0, 10);
      const base = slugifyFilename(tournament.name) || "semifinal";
      downloadPngBlob(blob, `${base}_${slugifyFilename(label) || "group"}_${stamp}.jpg`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Download failed. Try again in a moment.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-xl border border-sky-400/30 bg-canvas-overlay p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Semifinal groups</h2>
          <p className="mt-1 text-xs text-slate-500">
            Semifinal A on the left, Semifinal B on the right. Download them together or one at a time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy != null}
            className="rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-sm font-medium text-sky-100 hover:bg-sky-400/15 disabled:opacity-40"
            onClick={() => void save(bothRef.current, "semifinals", true)}
          >
            {busy === "semifinals" ? "Rendering…" : "Download both"}
          </button>
          {named.map((column, index) => (
            <button
              key={column.id}
              type="button"
              disabled={busy != null || column.teams.length === 0}
              className="rounded-md border border-sky-400/40 px-3 py-1.5 text-sm font-medium text-sky-100 hover:bg-sky-400/10 disabled:opacity-40"
              onClick={() => void save(index === 0 ? leftRef.current : rightRef.current, column.name, false)}
            >
              {busy === column.name ? "Rendering…" : `Download ${column.name}`}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black">
        <div className="mx-auto" style={{ width: previewW, height: height * scale }}>
          <div
            className="origin-top-left"
            style={{ width: SEMIFINAL_FIELD_EXPORT_W, transform: `scale(${scale})` }}
          >
            <SemifinalGroupsGraphic ref={bothRef} tournamentName={tournament.name} columns={named} />
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute left-[-10000px] top-0">
        <SemifinalGroupsGraphic
          ref={leftRef}
          tournamentName={tournament.name}
          columns={[named[0]!]}
          columnsPerGroup={4}
        />
        <SemifinalGroupsGraphic
          ref={rightRef}
          tournamentName={tournament.name}
          columns={[named[1]!]}
          columnsPerGroup={4}
        />
      </div>
    </section>
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
  const field = semifieldStage(tournament);
  const semis = semifinalStages(tournament);
  const available = unassignedTeams(tournament);
  const semiName = (teamId: string) =>
    semis.find((semi) => semi.teamIds.includes(teamId))?.name ??
    (field?.teamIds.includes(teamId) ? "Semifinal" : undefined);

  const toggle = (teamId: string) => {
    setPicked((prev) => {
      if (prev.includes(teamId)) return prev.filter((id) => id !== teamId);
      if (prev.length >= GROUP_ADVANCE_COUNT) return prev;
      return [...prev, teamId];
    });
  };
  const readyToSend = picked.length === GROUP_ADVANCE_COUNT;

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
                  disabled={!picked.includes(team.id) && picked.length >= GROUP_ADVANCE_COUNT}
                  onChange={() => toggle(team.id)}
                  aria-label={`Send ${team.name} to the semifinal`}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{team.name}</span>
                {semiName(team.id) && (
                  <span className="shrink-0 rounded-full border border-sky-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-100">
                    {semiName(team.id)}
                  </span>
                )}
                <button
                  type="button"
                  className="shrink-0 text-xs text-slate-500 hover:text-danger"
                  onClick={() => {
                    if (!confirm(`Delete ${team.name} from the tournament? Their scores are removed too.`)) {
                      return;
                    }
                    dispatch({ type: "removeTeam", teamId: team.id });
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!readyToSend}
            className="mt-2 rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-sm font-medium text-sky-100 hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              dispatch({ type: "moveTeamsToSemifinal", teamIds: picked });
              setPicked([]);
            }}
          >
            Move 4 to semifinal
          </button>
          <p className="mt-2 text-xs text-slate-500">
            {picked.length} of {GROUP_ADVANCE_COUNT} selected. They appear on the semifinal image. Group points stay here.
          </p>
        </div>
        <Leaderboard teams={teams} matches={matches} title={`${stage.name} results`} />
      </div>
    </section>
  );
}

function StageRosterCard({
  stage,
  kicker,
  borderClass,
  kickerClass,
  emptyText,
  note,
  split,
  promoteToFinal,
  onExport,
}: {
  stage: TournamentStage;
  kicker: string;
  borderClass: string;
  kickerClass: string;
  emptyText: string;
  note: string;
  split?: boolean;
  promoteToFinal?: boolean;
  onExport: () => void;
}) {
  const { tournament, dispatch } = useTournament();
  const [draft, setDraft] = useState(stage.name);
  const [picked, setPicked] = useState<string[]>([]);
  const teams = teamsInStage(tournament, stage);
  const matches = matchesInStage(tournament, stage);
  const finals = finalsStage(tournament);
  const inFinal = new Set(finals?.teamIds ?? []);
  const canPick = Boolean(split || promoteToFinal);

  return (
    <section className={`rounded-xl border bg-canvas-overlay p-4 shadow-panel ${borderClass}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[12rem] flex-1">
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${kickerClass}`}>{kicker}</p>
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
          className="rounded-md border border-line px-3 py-1.5 text-sm text-slate-200 hover:bg-canvas"
          onClick={onExport}
        >
          Export standings
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">{note}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Squads</h3>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {teams.length === 0 && <li className="px-3 py-4 text-sm text-slate-500">{emptyText}</li>}
            {teams.map((team) => (
              <li key={team.id} className="flex items-center gap-2 px-3 py-2">
                {canPick && (
                  <input
                    type="checkbox"
                    checked={picked.includes(team.id)}
                    disabled={promoteToFinal && inFinal.has(team.id)}
                    onChange={() =>
                      setPicked((prev) =>
                        prev.includes(team.id) ? prev.filter((id) => id !== team.id) : [...prev, team.id],
                      )
                    }
                    aria-label={`Send ${team.name} to the final`}
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{team.name}</span>
                {promoteToFinal && inFinal.has(team.id) && (
                  <span className="shrink-0 rounded-full border border-[#c9a227]/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#f5e6b8]">
                    Finals
                  </span>
                )}
                <button
                  type="button"
                  className="shrink-0 text-xs text-slate-500 hover:text-danger"
                  onClick={() =>
                    dispatch({ type: "removeTeamFromStage", stageId: stage.id, teamId: team.id })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {split && (
            <button
              type="button"
              disabled={picked.length === 0}
              className="mt-2 rounded-md border border-[#c9a227]/40 bg-[#2a2312]/80 px-3 py-1.5 text-sm font-medium text-[#f5e6b8] hover:bg-[#3a3018] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                dispatch({
                  type: "splitSemifinalGroup",
                  stageId: stage.id,
                  finalistIds: picked,
                });
                setPicked([]);
              }}
            >
              Selected to the final, the rest to last chance
            </button>
          )}
          {promoteToFinal && (
            <button
              type="button"
              disabled={picked.length === 0}
              className="mt-2 rounded-md border border-[#c9a227]/40 bg-[#2a2312]/80 px-3 py-1.5 text-sm font-medium text-[#f5e6b8] hover:bg-[#3a3018] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                dispatch({ type: "promoteLastChanceToFinal", teamIds: picked });
                setPicked([]);
              }}
            >
              Send selected to the final
            </button>
          )}
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
  const outside = tournament.teams.filter((team) => !stage.teamIds.includes(team.id));

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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={outside.length === 0 || stage.teamIds.length === 0}
            className="rounded-md border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              if (
                !confirm(
                  `Delete ${outside.length} squad${outside.length === 1 ? "" : "s"} that are not in the final? They are removed from every group and from the saved tournament.`,
                )
              ) {
                return;
              }
              dispatch({ type: "removeTeamsNotInFinal" });
            }}
          >
            Delete squads not in the final
          </button>
          <button
            type="button"
            className="rounded-md border border-[#c9a227]/40 px-3 py-1.5 text-sm text-[#f5e6b8] hover:bg-[#2a2312]"
            onClick={onExport}
          >
            Export final standings
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Final points start at zero. Enter final lobbies from the Live tab while Finals is selected.
        Semifinal and group scores are not carried over.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Finalists</h3>
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line">
            {teams.length === 0 && (
              <li className="px-3 py-4 text-sm text-slate-500">
                Check the top 6 in a semifinal group and send them here.
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
