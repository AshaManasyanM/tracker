import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Team } from "../types/tournament";
import type { PlayerStanding } from "../lib/playerStats";
import {
  captureElementToPngBlob,
  downloadPngBlob,
  slugifyFilename,
} from "../lib/graphicCapture";
import { MVP_EXPORT_H, MVP_EXPORT_W } from "./MvpGraphic";
import { MvpPairGraphic } from "./MvpPairGraphic";

const PREVIEW_SCALE = 0.42;

type MvpSlot = {
  mvp: PlayerStanding;
  team: Team;
};

export function MvpGraphicsModal({
  open,
  onClose,
  tournamentName,
  boy,
  girl,
}: {
  open: boolean;
  onClose: () => void;
  tournamentName: string;
  boy: MvpSlot | null;
  girl: MvpSlot | null;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const stamp = new Date().toISOString().slice(0, 10);
  const base = slugifyFilename(tournamentName) || "mvp";
  const canCombined = boy != null && girl != null;

  const graphicProps = {
    tournamentName,
    boy: boy
      ? {
          mvpGender: "boy" as const,
          playerName: boy.mvp.playerName,
          team: boy.team,
          totalKills: boy.mvp.totalKills,
          matchesPlayed: boy.mvp.matchesPlayed,
        }
      : null,
    girl: girl
      ? {
          mvpGender: "girl" as const,
          playerName: girl.mvp.playerName,
          team: girl.team,
          totalKills: girl.mvp.totalKills,
          matchesPlayed: girl.mvp.matchesPlayed,
        }
      : null,
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const downloadPng = useCallback(async () => {
    const el = captureRef.current;
    if (!el || !canCombined) return;
    setDownloading(true);
    try {
      const blob = await captureElementToPngBlob(el, MVP_EXPORT_W, MVP_EXPORT_H);
      downloadPngBlob(blob, `${base}_mvp_boy_girl_${stamp}.png`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Download failed. Try again in a moment.");
    } finally {
      setDownloading(false);
    }
  }, [base, stamp, canCombined]);

  if (!open) return null;

  const previewW = MVP_EXPORT_W * PREVIEW_SCALE;
  const previewH = MVP_EXPORT_H * PREVIEW_SCALE;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="MVP graphic"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[100dvh] w-full max-w-[min(1240px,100vw)] flex-col gap-3 overflow-y-auto rounded-t-2xl border border-[#c9a227]/35 bg-[#070b14] p-3 shadow-[0_0_80px_rgba(0,0,0,0.65)] sm:max-h-[94vh] sm:gap-4 sm:rounded-2xl sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-[#E6C15A]">
              MVP graphic
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              1920×1080 · boy and girl MVP names and teams on one image.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={downloading || !canCombined}
              onClick={() => void downloadPng()}
              className="rounded-lg border border-[#c9a227]/50 bg-gradient-to-b from-[#3a3018] to-[#1a150a] px-4 py-2.5 text-sm font-semibold text-[#fff3cc] shadow-[0_0_24px_rgba(201,162,39,0.25)] hover:from-[#4a3f22] hover:to-[#221c0e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? "Rendering…" : "Download PNG"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line bg-canvas-overlay px-4 py-2.5 text-sm text-slate-200 hover:border-white/20"
            >
              Close
            </button>
          </div>
        </div>

        {canCombined ? (
          <div className="w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl ring-1 ring-[#c9a227]/20">
            <div className="w-full overflow-x-auto overscroll-x-contain bg-black py-1 [-webkit-overflow-scrolling:touch]">
              <div
                className="mx-auto max-h-[min(70dvh,900px)] overflow-y-auto sm:max-h-[min(82vh,900px)]"
                style={{ width: previewW + 8 }}
              >
                <div
                  className="relative mx-auto overflow-hidden"
                  style={{ width: previewW, height: previewH }}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width: MVP_EXPORT_W,
                      transform: `scale(${PREVIEW_SCALE})`,
                    }}
                  >
                    <MvpPairGraphic {...graphicProps} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-warn/30 bg-warn/10 px-4 py-4 text-sm text-warn">
            Need both a boy MVP and a girl MVP with elims logged in Live console (mark players as
            Boy or Girl on Teams when adding them).
          </p>
        )}

        {canCombined && (
          <div
            className="pointer-events-none fixed left-0 top-0 -z-[1] overflow-visible opacity-0"
            style={{ width: MVP_EXPORT_W, height: MVP_EXPORT_H, lineHeight: "normal" }}
            aria-hidden="true"
          >
            <MvpPairGraphic ref={captureRef} {...graphicProps} />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
