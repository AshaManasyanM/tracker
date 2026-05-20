import { useMemo, useState } from "react";
import type { Match, Team } from "../types/tournament";
import { getMvps } from "../lib/playerStats";
import { MvpGraphicsModal } from "./MvpGraphicsModal";

function useMvpGraphicsState(teams: Team[], matches: Match[]) {
  const mvps = useMemo(() => getMvps(teams, matches), [teams, matches]);
  const hasRoster = teams.some((t) => (t.players?.length ?? 0) > 0);

  const boySlot = useMemo(() => {
    if (!mvps.boy) return null;
    const team = teams.find((t) => t.id === mvps.boy!.teamId);
    return team ? { mvp: mvps.boy, team } : null;
  }, [mvps.boy, teams]);

  const girlSlot = useMemo(() => {
    if (!mvps.girl) return null;
    const team = teams.find((t) => t.id === mvps.girl!.teamId);
    return team ? { mvp: mvps.girl, team } : null;
  }, [mvps.girl, teams]);

  return { boySlot, girlSlot, hasRoster };
}

/** Opens MVP graphic modal (preview → Download PNG), same flow as group stage graphic. */
export function MvpGraphicsControls({
  teams,
  matches,
  tournamentName,
}: {
  teams: Team[];
  matches: Match[];
  tournamentName: string;
}) {
  const [open, setOpen] = useState(false);
  const { boySlot, girlSlot, hasRoster } = useMvpGraphicsState(teams, matches);

  if (!hasRoster) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="rounded-lg border border-[#c9a227]/40 bg-gradient-to-b from-[#2a2312]/90 to-[#120f08] px-3 py-2 text-sm font-semibold text-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.15)] hover:border-[#e8c547]/60 hover:from-[#3a3018] hover:to-[#1a150a]"
        title="Preview boy and girl MVP graphic, then download PNG"
        onClick={() => setOpen(true)}
      >
        <span className="sm:hidden">MVP</span>
        <span className="hidden sm:inline">MVP graphic</span>
      </button>
      <MvpGraphicsModal
        open={open}
        onClose={() => setOpen(false)}
        tournamentName={tournamentName}
        boy={boySlot}
        girl={girlSlot}
      />
    </>
  );
}
