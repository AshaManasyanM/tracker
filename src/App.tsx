import { useMemo, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { LiveConsole } from "./components/LiveConsole";
import { TeamPanel } from "./components/TeamPanel";
import { MatchPanel } from "./components/MatchPanel";
import { RulesPanel } from "./components/RulesPanel";
import { useTournament } from "./state/TournamentContext";

type Tab = "live" | "teams" | "matches" | "rules";

const tabs: { id: Tab; label: string; shortLabel: string; hint: string }[] = [
  {
    id: "live",
    label: "Live console",
    shortLabel: "Live",
    hint: "Enter results and watch standings update",
  },
  {
    id: "teams",
    label: "Teams",
    shortLabel: "Teams",
    hint: "Squads, logos, and rosters — add as many as you need",
  },
  {
    id: "matches",
    label: "Matches",
    shortLabel: "Matches",
    hint: "Unlimited rounds — rename, add, remove",
  },
  {
    id: "rules",
    label: "Scoring",
    shortLabel: "Scoring",
    hint: "PMGC-style table used for placement points",
  },
];

export default function App() {
  const { persistMode } = useTournament();
  const [tab, setTab] = useState<Tab>("live");
  const body = useMemo(() => {
    switch (tab) {
      case "live":
        return <LiveConsole />;
      case "teams":
        return <TeamPanel />;
      case "matches":
        return <MatchPanel />;
      case "rules":
        return <RulesPanel />;
      default:
        return null;
    }
  }, [tab]);

  return (
    <div className="flex min-h-dvh min-w-0 flex-col">
      <HeaderBar />
      {persistMode === "local" && (
        <div
          role="note"
          className="border-b border-amber-500/25 bg-amber-500/5 px-3 py-2 text-center text-[11px] leading-snug text-amber-100/90 sm:text-xs"
        >
          <strong className="text-amber-50">This browser only:</strong> this draft is stored in{" "}
          <code className="rounded bg-black/20 px-1 text-amber-100/95">localStorage</code> for this exact site address (
          <code className="rounded bg-black/20 px-1">localhost</code>, a Wi‑Fi IP, and your deployed URL each have
          separate data). Signing in on your phone will not show this machine&apos;s draft unless you use{" "}
          <strong>Export JSON</strong> or <strong>Save copy to account</strong> in the header.
        </div>
      )}
      <nav
        className="border-b border-line bg-canvas-raised/80 backdrop-blur"
        aria-label="Tournament sections"
      >
        <div className="mx-auto max-w-[1600px] overflow-x-auto px-3 py-2 [-webkit-overflow-scrolling:touch] sm:px-4">
          <div className="flex w-max min-w-full gap-1 sm:w-auto sm:flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.hint}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition sm:shrink ${
                tab === t.id
                  ? "bg-canvas-overlay text-accent-glow shadow-panel"
                  : "text-slate-400 hover:bg-canvas-overlay/60 hover:text-slate-200"
              }`}
            >
              <span className="sm:hidden">{t.shortLabel}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full min-w-0 max-w-[1600px] flex-1 px-3 py-3 pb-6 sm:px-4 sm:py-4">
        {body}
      </main>
      <footer className="border-t border-line py-3 text-center text-xs text-slate-500">
        {persistMode === "remote"
          ? "Scrim Command — saved to your account. Export JSON from the header for a backup."
          : "Scrim Command — local auto-save in this browser only. Export JSON from the header when you need a backup."}
      </footer>
    </div>
  );
}
