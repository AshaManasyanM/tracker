import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useTournament } from "../state/TournamentContext";
import { FinalResultsModal } from "./FinalResultsModal";
import { MvpGraphicsControls } from "./MvpGraphicsControls";
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
  const jsonBtnRef = useRef<HTMLButtonElement>(null);
  const jsonMenuPanelRef = useRef<HTMLDivElement>(null);
  const [jsonMenuRect, setJsonMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [finalOpen, setFinalOpen] = useState(false);
  const [cloudCopyBusy, setCloudCopyBusy] = useState(false);
  const [jsonMenuOpen, setJsonMenuOpen] = useState(false);

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

  const closeJsonMenu = () => {
    setJsonMenuOpen(false);
    setJsonMenuRect(null);
  };

  const openJsonMenu = () => {
    const btn = jsonBtnRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      setJsonMenuRect({ top: r.bottom + 4, left: r.right, width: r.width });
    }
    setJsonMenuOpen(true);
  };

  const toggleJsonMenu = () => {
    if (jsonMenuOpen) closeJsonMenu();
    else openJsonMenu();
  };

  useEffect(() => {
    if (!jsonMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (jsonBtnRef.current?.contains(t) || jsonMenuPanelRef.current?.contains(t)) return;
      closeJsonMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeJsonMenu();
    };
    const onScrollOrResize = () => closeJsonMenu();
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [jsonMenuOpen]);

  const exportJson = () => {
    downloadJson(
      `scrim-${tournament.name.replace(/[^\w\-]+/g, "_").slice(0, 40) || "tournament"}.json`,
      tournament,
    );
    closeJsonMenu();
  };

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
      closeJsonMenu();
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
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
            <span className="sm:hidden">Graphic</span>
            <span className="hidden sm:inline">Group stage graphic</span>
          </button>
          <MvpGraphicsControls
            teams={tournament.teams}
            matches={tournament.matches}
            tournamentName={tournament.name}
          />
          <button
            ref={jsonBtnRef}
            type="button"
            aria-expanded={jsonMenuOpen}
            aria-haspopup="menu"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-canvas-overlay px-3 py-2 text-sm text-slate-200 hover:border-accent/30 hover:text-white"
            onClick={toggleJsonMenu}
          >
            JSON
            <span className="text-[10px] text-slate-500" aria-hidden>
              ▾
            </span>
          </button>
          {jsonMenuOpen &&
            jsonMenuRect &&
            createPortal(
              <div
                ref={jsonMenuPanelRef}
                role="menu"
                style={{
                  position: "fixed",
                  top: jsonMenuRect.top,
                  left: Math.max(8, jsonMenuRect.left + jsonMenuRect.width - 168),
                  width: 168,
                  zIndex: 300,
                }}
                className="rounded-lg border border-line bg-canvas-raised py-1 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-canvas-overlay"
                  onClick={exportJson}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-canvas-overlay"
                  onClick={() => {
                    closeJsonMenu();
                    fileRef.current?.click();
                  }}
                >
                  Import JSON
                </button>
              </div>,
              document.body,
            )}
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
          {persistMode === "local" && user && isSupabaseConfigured && (
            <button
              type="button"
              disabled={cloudCopyBusy}
              className="rounded-lg border border-accent/35 bg-accent/10 px-3 py-2 text-sm font-medium text-accent-glow hover:bg-accent/20 disabled:opacity-50"
              title="Upload this draft to your account so you can open it on another device"
              onClick={() => void onSaveCopyToCloud()}
            >
              {cloudCopyBusy ? "Saving…" : (
                <>
                  <span className="sm:hidden">Save to cloud</span>
                  <span className="hidden sm:inline">Save copy to account</span>
                </>
              )}
            </button>
          )}
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
