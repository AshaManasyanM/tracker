import { useMemo, useState } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { LiveConsole } from "./components/LiveConsole";
import { TeamPanel } from "./components/TeamPanel";
import { MatchPanel } from "./components/MatchPanel";
import { RulesPanel } from "./components/RulesPanel";

type Tab = "live" | "teams" | "matches" | "rules";

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: "live", label: "Live console", hint: "Enter results and watch standings update" },
  { id: "teams", label: "Teams", hint: `Up to 20 squads — roster fields you can extend later` },
  { id: "matches", label: "Matches", hint: "Unlimited rounds — rename, add, remove" },
  { id: "rules", label: "Scoring", hint: "PMGC-style table used for placement points" },
];

export default function App() {
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
    <div className="flex min-h-full flex-col">
      <HeaderBar />
      <div className="border-b border-line bg-canvas-raised/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap gap-1 px-3 py-2 sm:px-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.hint}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-canvas-overlay text-accent-glow shadow-panel"
                  : "text-slate-400 hover:bg-canvas-overlay/60 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-4 sm:px-4">{body}</main>
      <footer className="border-t border-line py-3 text-center text-xs text-slate-500">
        Scrim Command — local auto-save in this browser only. Export JSON from the header when you
        need a backup.
      </footer>
    </div>
  );
}
