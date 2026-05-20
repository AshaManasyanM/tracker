import { useEffect, useMemo, useState } from "react";
import { formatMatchDisplay, groupMatchesByDay } from "../lib/matchDisplay";
import type { Match } from "../types/tournament";

export function MatchDayPicker({
  matches,
  activeId,
  onSelect,
}: {
  matches: Match[];
  activeId: string | null;
  onSelect: (matchId: string) => void;
}) {
  const groups = useMemo(() => groupMatchesByDay(matches), [matches]);
  const activeDay = matches.find((m) => m.id === activeId)?.day;
  const [openDays, setOpenDays] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    if (activeDay != null && activeDay > 0) initial.add(activeDay);
    else if (groups[0]) initial.add(groups[0].day);
    return initial;
  });

  useEffect(() => {
    if (activeDay != null && activeDay > 0) {
      setOpenDays((prev) => new Set(prev).add(activeDay));
    }
  }, [activeDay]);

  const toggleDay = (day: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  if (matches.length === 0) return null;

  return (
    <div className="rounded-lg border border-line bg-canvas-overlay text-sm">
      {groups.map((group) => {
        const open = openDays.has(group.day);
        return (
          <div key={group.day} className="border-b border-line last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs text-slate-400 hover:bg-canvas-raised"
              onClick={() => toggleDay(group.day)}
              aria-expanded={open}
            >
              <span
                className={`transition-transform ${open ? "rotate-90" : ""}`}
                aria-hidden
              >
                ▶
              </span>
              <span className="font-medium text-slate-300">{group.title}</span>
            </button>
            {open && (
              <ul className="flex flex-wrap gap-1.5 px-2 pb-2">
                {group.matches.map((m) => {
                  const active = m.id === activeId;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(m.id)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          active
                            ? "border-accent/50 bg-accent/15 font-medium text-accent-glow"
                            : "border-line text-slate-300 hover:bg-canvas-raised"
                        }`}
                      >
                        {formatMatchDisplay(m)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
