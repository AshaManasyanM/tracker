import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useTournament } from "../state/TournamentContext";
import { FinalResultsModal } from "./FinalResultsModal";
import { clearTournament, saveTournament } from "../lib/storage";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { saveLocalScratchAsCloudTournament } from "../lib/tournamentDb";
import type { Tournament } from "../types/tournament";
import { STORAGE_KEY } from "../types/tournament";
import { forkEmptyTournamentKeepId } from "../lib/tournamentDefaults";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function HeaderBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tournament, dispatch, saveStatus, persistMode } = useTournament();
  const [nameDraft, setNameDraft] = useState(tournament.name);
  const fileRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [finalOpen, setFinalOpen] = useState(false);
  const [cloudCopyBusy, setCloudCopyBusy] = useState(false);

  useEffect(() => {
    setNameDraft(tournament.name);
  }, [tournament.name]);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const t = setTimeout(() => setFlash("Saved"), 0);
    const t2 = setTimeout(() => setFlash(null), 1200);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [saveStatus, tournament.updatedAt]);

  const statusLabel = useMemo(() => {
    if (saveStatus === "error") return "Save failed";
    if (saveStatus === "saving") return "Saving…";
    if (flash === "Saved") return "Saved";
    return "Auto-save on";
  }, [saveStatus, flash]);

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Tournament;
      if (!data?.teams || !data?.matches) throw new Error("Invalid file");
      const merged: Tournament = {
        ...data,
        id: tournament.id,
        updatedAt: Date.now(),
      };
      if (persistMode === "remote") {
        dispatch({ type: "hydrate", tournament: merged });
      } else {
        saveTournament(merged);
        window.location.reload();
      }
    } catch {
      alert("Could not import that JSON file.");
    }
  };

  const onSaveCopyToCloud = async () => {
    if (!user || !isSupabaseConfigured) return;
    setCloudCopyBusy(true);
    try {
      const id = await saveLocalScratchAsCloudTournament(tournament);
      navigate(`/t/${id}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save a copy to your account.");
    } finally {
      setCloudCopyBusy(false);
    }
  };

  return (
    <header className="border-b border-line bg-canvas-raised/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-2">
          {/* <h2 className="hidden sm:inline">PUBG Mobile admin</h2> */}
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
              Scrim Command
            </h1>
           
            {persistMode === "remote" ? (
              <Link
                to="/"
                className="text-lg font-semibold tracking-tight sm:text-xl text-accent hover:text-accent-glow hover:underline"
              >
                My tournaments
              </Link>
            ) : user ? (
              <Link
                to="/"
                className="text-xs font-medium text-accent hover:text-accent-glow hover:underline"
              >
                Cloud tournaments
              </Link>
            ) : null}
          </div>
          <label className="flex max-w-xl items-center gap-2 text-sm text-slate-400">
            <span className="shrink-0">Tournament</span>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() =>
                dispatch({
                  type: "renameTournament",
                  name: nameDraft.trim() || tournament.name,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-2 py-1.5 text-slate-100 placeholder:text-slate-600 focus:border-accent/50"
              placeholder="Room name, league day, etc."
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium tabular-nums ${
              saveStatus === "error"
                ? "border-danger/40 text-danger"
                : saveStatus === "saving"
                  ? "border-line text-slate-400"
                  : "border-accent/25 text-accent"
            }`}
            title={persistMode === "remote" ? "Cloud save" : `Browser key: ${STORAGE_KEY}`}
          >
            {statusLabel}
          </span>
          <button
            type="button"
            className="rounded-lg border border-[#c9a227]/40 bg-gradient-to-b from-[#2a2312]/90 to-[#120f08] px-3 py-2 text-sm font-semibold text-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.15)] hover:border-[#e8c547]/60 hover:from-[#3a3018] hover:to-[#1a150a]"
            onClick={() => setFinalOpen(true)}
          >
            Group stage graphic
          </button>
      
          <button
            type="button"
            className="rounded-lg border border-line bg-canvas-overlay px-3 py-2 text-sm text-slate-200 hover:border-accent/30 hover:text-white"
            onClick={() =>
              downloadJson(
                `scrim-${tournament.name.replace(/[^\w\-]+/g, "_").slice(0, 40) || "tournament"}.json`,
                tournament,
              )
            }
          >
            Export JSON
          </button>
          {persistMode === "local" && user && isSupabaseConfigured && (
            <button
              type="button"
              disabled={cloudCopyBusy}
              className="rounded-lg border border-accent/35 bg-accent/10 px-3 py-2 text-sm font-medium text-accent-glow hover:bg-accent/20 disabled:opacity-50"
              title="Upload this draft to your account so you can open it on another device"
              onClick={() => void onSaveCopyToCloud()}
            >
              {cloudCopyBusy ? "Saving…" : "Save copy to account"}
            </button>
          )}
          <button
            type="button"
            className="rounded-lg border border-line bg-canvas-overlay px-3 py-2 text-sm text-slate-200 hover:border-accent/30 hover:text-white"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void onImport(f);
            }}
          />
          <button
            type="button"
            className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger hover:bg-danger/20"
            onClick={() => {
              if (persistMode === "remote") {
                if (
                  !confirm(
                    "Clear all teams, matches, and scores for this tournament? The room stays open — this cannot be undone.",
                  )
                )
                  return;
                dispatch({
                  type: "hydrate",
                  tournament: forkEmptyTournamentKeepId(tournament.id, tournament.name),
                });
                return;
              }
              if (
                !confirm(
                  "Reset everything in this browser? This clears saved progress after reload.",
                )
              )
                return;
              clearTournament();
              window.location.reload();
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <FinalResultsModal
        open={finalOpen}
        onClose={() => setFinalOpen(false)}
        tournament={tournament}
      />
    </header>
  );
}
