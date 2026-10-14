import { useTournament } from "../state/TournamentContext";
import { finalsStage, groupStages, stageSlice } from "../lib/stages";

export function StageSwitcher() {
  const { tournament, dispatch } = useTournament();
  const slice = stageSlice(tournament);
  if (!slice.enabled) return null;

  const groups = groupStages(tournament);
  const finals = finalsStage(tournament);
  const looseMatches = tournament.matches.filter((m) => !m.stageId).length;

  return (
    <div className="border-b border-line bg-canvas/80">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Stage
          </span>
          {groups.map((stage) => {
            const selected = slice.active?.id === stage.id;
            return (
              <button
                key={stage.id}
                type="button"
                aria-pressed={selected}
                onClick={() => dispatch({ type: "setActiveStage", stageId: stage.id })}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  selected
                    ? "bg-canvas-overlay text-accent-glow shadow-panel"
                    : "text-slate-400 hover:bg-canvas-overlay/60 hover:text-slate-200"
                }`}
              >
                {stage.name}
                <span className="ml-1.5 text-xs text-slate-500">{stage.teamIds.length}</span>
              </button>
            );
          })}
          {finals && (
            <button
              type="button"
              aria-pressed={slice.active?.id === finals.id}
              onClick={() => dispatch({ type: "setActiveStage", stageId: finals.id })}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                slice.active?.id === finals.id
                  ? "border-[#c9a227]/50 bg-[#2a2312] text-[#f5e6b8]"
                  : "border-line text-slate-300 hover:border-[#c9a227]/40"
              }`}
            >
              {finals.name}
              <span className="ml-1.5 text-xs text-slate-500">{finals.teamIds.length}</span>
            </button>
          )}
        </div>
        {looseMatches > 0 && (
          <p className="text-xs text-amber-200/90">
            {looseMatches} match{looseMatches === 1 ? "" : "es"} from before groups{" "}
            {looseMatches === 1 ? "is" : "are"} not in a stage. Assign {looseMatches === 1 ? "it" : "them"} on
            the Groups tab so those points stay out of the other tables.
          </p>
        )}
      </div>
    </div>
  );
}
