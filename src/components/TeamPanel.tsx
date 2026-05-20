import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useTournament } from "../state/TournamentContext";
import type { Player, PlayerGender, Team } from "../types/tournament";
import { genderLabel, isPlayerGender, playerHasGender } from "../lib/playerGender";
import { MAX_PLAYERS_PER_TEAM } from "../lib/matchResultKills";
import { processTeamLogoFile } from "../lib/processTeamLogo";
import { TeamAvatar } from "./TeamAvatar";

export function TeamPanel() {
  const { tournament, dispatch } = useTournament();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  const filteredTeams = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return tournament.teams;
    return tournament.teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.tag?.toLowerCase().includes(q) ?? false),
    );
  }, [tournament.teams, teamSearch]);

  const add = () => {
    dispatch({ type: "addTeam", name: name || `Squad ${tournament.teams.length + 1}`, tag });
    setName("");
    setTag("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-line bg-canvas-overlay p-4 shadow-panel">
        <h2 className="text-base font-semibold text-slate-100">Add team</h2>
        <p className="mt-1 text-xs text-slate-500">
          Logos and <span className="text-slate-400">player rosters</span> live here — with a roster,
          Live console splits elims per player and auto-sums team kills for scoring.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-xs text-slate-400">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              maxLength={64}
              placeholder="e.g. Alpha Esports"
              className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="sm:w-32 text-xs text-slate-400">
            Tag
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              maxLength={8}
              placeholder="ALP"
              className="mt-1 w-full rounded-md border border-line bg-canvas px-2 py-2 text-sm text-slate-100"
            />
          </label>
          <button
            type="button"
            onClick={add}
            className="rounded-md border border-accent/35 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-glow hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-canvas-overlay p-4 shadow-panel">
        <h2 className="text-base font-semibold text-slate-100">Roster order</h2>
        <p className="mt-1 text-xs text-slate-500">
          Order controls the Live console grid — put active squads at the top for faster typing.
          Each player needs <span className="text-slate-400">Boy</span> or{" "}
          <span className="text-slate-400">Girl</span> for separate MVPs.
        </p>
        <label className="mt-3 block text-xs text-slate-400">
          <span className="sr-only">Search teams</span>
          <input
            type="search"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            placeholder="Search teams…"
            className="w-full rounded-md border border-line bg-canvas px-2 py-1.5 text-sm text-slate-100 placeholder:text-slate-600"
          />
        </label>
        <ul className="mt-3 max-h-[min(60dvh,520px)] overflow-y-auto rounded-lg border border-line bg-canvas lg:max-h-none">
          {tournament.teams.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">No teams yet.</li>
          )}
          {tournament.teams.length > 0 && filteredTeams.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-slate-500">
              No teams match &ldquo;{teamSearch.trim()}&rdquo;.
            </li>
          )}
          {filteredTeams.map((t) => (
            <TeamRow
              key={t.id}
              team={t}
              index={tournament.teams.findIndex((x) => x.id === t.id)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function TeamRow({ team, index }: { team: Team; index: number }) {
  const { tournament, dispatch } = useTournament();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [tag, setTag] = useState(team.tag ?? "");
  const [logoBusy, setLogoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const move = (dir: -1 | 1) => {
    const ids = tournament.teams.map((x) => x.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    dispatch({ type: "reorderTeams", teamIds: next });
  };

  const save = () => {
    dispatch({ type: "updateTeam", teamId: team.id, name, tag });
    setEditing(false);
  };

  const onLogoFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoBusy(true);
    try {
      const logoDataUrl = await processTeamLogoFile(file);
      dispatch({ type: "setTeamLogo", teamId: team.id, logoDataUrl });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not process that image.");
    } finally {
      setLogoBusy(false);
    }
  };

  return (
    <li className="flex flex-col gap-3 border-b border-line/60 py-3 pl-4 pr-3 last:border-b-0 sm:pl-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="flex shrink-0 flex-col items-start gap-1">
            <TeamAvatar team={team} size="lg" />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onLogoFile(e)}
            />
            <button
              type="button"
              disabled={logoBusy}
              className="rounded border border-line px-2 py-0.5 text-[10px] text-slate-300 hover:bg-canvas-overlay disabled:opacity-50"
              onClick={() => fileRef.current?.click()}
            >
              {logoBusy ? "…" : "Logo"}
            </button>
            {team.logoDataUrl && (
              <button
                type="button"
                className="text-[10px] text-slate-500 hover:text-danger"
                onClick={() =>
                  dispatch({ type: "setTeamLogo", teamId: team.id, logoDataUrl: null })
                }
              >
                Clear
              </button>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex flex-wrap gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-w-[160px] flex-1 rounded-md border border-line bg-canvas px-2 py-1.5 text-sm"
                />
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-24 rounded-md border border-line bg-canvas px-2 py-1.5 text-sm"
                  placeholder="Tag"
                />
                <button
                  type="button"
                  className="rounded-md border border-line px-2 py-1 text-xs text-slate-200"
                  onClick={save}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent px-2 py-1 text-xs text-slate-500"
                  onClick={() => {
                    setName(team.name);
                    setTag(team.tag ?? "");
                    setEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => setEditing(true)}
                title="Click to edit"
              >
                <div className="truncate font-medium text-slate-100">{team.name}</div>
                {team.tag && <div className="truncate text-xs text-slate-500">{team.tag}</div>}
              </button>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1 sm:justify-end">
          <button
            type="button"
            className="rounded border border-line px-2 py-1 text-xs text-slate-300 hover:bg-canvas-overlay"
            onClick={() => move(-1)}
            disabled={index === 0}
          >
            Up
          </button>
          <button
            type="button"
            className="rounded border border-line px-2 py-1 text-xs text-slate-300 hover:bg-canvas-overlay"
            onClick={() => move(1)}
            disabled={index === tournament.teams.length - 1}
          >
            Down
          </button>
          {!editing && (
            <button
              type="button"
              className="rounded border border-line px-2 py-1 text-xs text-slate-300 hover:bg-canvas-overlay"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
          <button
            type="button"
            className="rounded border border-danger/30 px-2 py-1 text-xs text-danger hover:bg-danger/10"
            onClick={() => {
              if (!confirm(`Remove ${team.name} and all their match rows?`)) return;
              dispatch({ type: "removeTeam", teamId: team.id });
            }}
          >
            Remove
          </button>
        </div>
      </div>
      <TeamRosterEditor team={team} />
    </li>
  );
}

function GenderToggle({
  value,
  onChange,
  invalid,
}: {
  value: PlayerGender | "";
  onChange: (g: PlayerGender) => void;
  invalid?: boolean;
}) {
  const base =
    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors";
  const active = "border-accent/50 bg-accent/15 text-accent-glow";
  const idle = "border-line text-slate-400 hover:border-slate-500 hover:text-slate-200";
  const ring = invalid ? "ring-1 ring-warn/50" : "";

  return (
    <div className={`flex gap-1 ${ring}`} role="group" aria-label="Boy or girl">
      {(["boy", "girl"] as const).map((g) => (
        <button
          key={g}
          type="button"
          className={`${base} ${value === g ? active : idle}`}
          aria-pressed={value === g}
          onClick={() => onChange(g)}
        >
          {genderLabel(g)}
        </button>
      ))}
    </div>
  );
}

function TeamRosterEditor({ team }: { team: Team }) {
  const { dispatch } = useTournament();
  const players = team.players ?? [];
  const [draft, setDraft] = useState("");
  const [draftGender, setDraftGender] = useState<PlayerGender | "">("");
  const atCap = players.length >= MAX_PLAYERS_PER_TEAM;
  const canAdd = draft.trim().length > 0 && isPlayerGender(draftGender) && !atCap;

  const add = () => {
    if (!canAdd || !isPlayerGender(draftGender)) return;
    dispatch({ type: "addPlayer", teamId: team.id, name: draft, gender: draftGender });
    setDraft("");
    setDraftGender("");
  };

  return (
    <div className="rounded-lg border border-line/80 bg-canvas/40 px-3 py-2 sm:ml-[4.5rem]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Players
        </span>
        <span className="text-[10px] text-slate-600">
          {players.length}/{MAX_PLAYERS_PER_TEAM}
        </span>
      </div>
      {players.length > 0 && (
        <ul className="mb-2 space-y-1.5">
          {players.map((p) => (
            <PlayerRow key={p.id} teamId={team.id} player={p} />
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canAdd && add()}
          maxLength={48}
          placeholder="Player name"
          disabled={atCap}
          className="min-w-[140px] flex-1 rounded-md border border-line bg-canvas px-2 py-1.5 text-xs text-slate-100 disabled:opacity-40"
        />
        <GenderToggle
          value={draftGender}
          onChange={setDraftGender}
          invalid={draft.trim().length > 0 && !isPlayerGender(draftGender)}
        />
        <button
          type="button"
          disabled={!canAdd}
          onClick={add}
          className="rounded-md border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-glow hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add player
        </button>
      </div>
      {draft.trim() && !isPlayerGender(draftGender) && (
        <p className="mt-1.5 text-[10px] text-warn">Choose Boy or Girl before adding.</p>
      )}
    </div>
  );
}

function PlayerRow({ teamId, player }: { teamId: string; player: Player }) {
  const { dispatch } = useTournament();
  const [name, setName] = useState(player.name);
  const gender = playerHasGender(player) ? player.gender : "";

  useEffect(() => {
    setName(player.name);
  }, [player.id, player.name]);

  return (
    <li className="flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() =>
          dispatch({
            type: "updatePlayer",
            teamId,
            playerId: player.id,
            name,
          })
        }
        maxLength={48}
        className="min-w-0 flex-1 rounded border border-line bg-canvas px-2 py-1 text-xs text-slate-100"
      />
      <GenderToggle
        value={gender}
        onChange={(g) =>
          dispatch({
            type: "updatePlayer",
            teamId,
            playerId: player.id,
            gender: g,
          })
        }
        invalid={!playerHasGender(player)}
      />
      <button
        type="button"
        className="shrink-0 rounded border border-line px-2 py-0.5 text-[10px] text-slate-400 hover:border-danger/40 hover:text-danger"
        onClick={() =>
          dispatch({
            type: "removePlayer",
            teamId,
            playerId: player.id,
          })
        }
      >
        Remove
      </button>
    </li>
  );
}
