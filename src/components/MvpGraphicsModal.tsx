import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { PlayerGender, Team } from "../types/tournament";
import type { PlayerStanding } from "../lib/playerStats";
import {
  captureVisibleGraphic,
  downloadPngBlob,
  measureGraphicExportHeight,
  slugifyFilename,
} from "../lib/graphicCapture";
import {
  MvpGraphic,
  MVP_EXPORT_MAX_H,
  MVP_EXPORT_MIN_H,
  MVP_EXPORT_W,
} from "./MvpGraphic";

const PREVIEW_SCALE = 0.42;
const PREVIEW_GAP_PX = 40;

type MvpSlot = {
  mvp: PlayerStanding;
  team: Team;
};

function slotToProps(tournamentName: string, slot: MvpSlot, gender: PlayerGender) {
  return {
    tournamentName,
    mvpGender: gender,
    playerName: slot.mvp.playerName,
    team: slot.team,
    totalKills: slot.mvp.totalKills,
  };
}

function MvpGraphicPreview({
  label,
  contentHeight,
  children,
}: {
  label: string;
  contentHeight: number;
  children: ReactNode;
}) {
  const previewW = MVP_EXPORT_W * PREVIEW_SCALE;
  const previewH = contentHeight * PREVIEW_SCALE;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="mx-auto py-1" style={{ width: previewW + 8, height: previewH + 8 }}>
          <div
            className="relative mx-auto overflow-hidden"
            style={{ width: previewW, height: previewH }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: MVP_EXPORT_W, transform: `scale(${PREVIEW_SCALE})` }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const boyRef = useRef<HTMLDivElement>(null);
  const girlRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<PlayerGender | null>(null);
  const [boyHeight, setBoyHeight] = useState(MVP_EXPORT_MIN_H);
  const [girlHeight, setGirlHeight] = useState(MVP_EXPORT_MIN_H);

  const stamp = new Date().toISOString().slice(0, 10);
  const base = slugifyFilename(tournamentName) || "mvp";
  const hasBoy = boy != null;
  const hasGirl = girl != null;
  const hasAny = hasBoy || hasGirl;

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      if (boyRef.current) {
        setBoyHeight(
          Math.max(
            MVP_EXPORT_MIN_H,
            measureGraphicExportHeight(boyRef.current, MVP_EXPORT_MAX_H),
          ),
        );
      }
      if (girlRef.current) {
        setGirlHeight(
          Math.max(
            MVP_EXPORT_MIN_H,
            measureGraphicExportHeight(girlRef.current, MVP_EXPORT_MAX_H),
          ),
        );
      }
    };
    measure();
    const nodes = [boyRef.current, girlRef.current].filter(Boolean) as HTMLElement[];
    const ro = new ResizeObserver(measure);
    for (const n of nodes) ro.observe(n);
    return () => ro.disconnect();
  }, [open, tournamentName, boy, girl]);

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

  const downloadPng = useCallback(
    async (gender: PlayerGender) => {
      const el = gender === "boy" ? boyRef.current : girlRef.current;
      if (!el) return;
      setDownloading(gender);
      try {
        const exportH = Math.max(
          MVP_EXPORT_MIN_H,
          measureGraphicExportHeight(el, MVP_EXPORT_MAX_H),
        );
        const blob = await captureVisibleGraphic(el, MVP_EXPORT_W, exportH);
        downloadPngBlob(blob, `${base}_mvp_${gender}_${stamp}.jpg`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Download failed. Try again in a moment.");
      } finally {
        setDownloading(null);
      }
    },
    [base, stamp],
  );

  if (!open) return null;

  const busy = downloading != null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="MVP graphics"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-graphic-modal-scroll
        className="flex max-h-[100dvh] w-full max-w-[min(1240px,100vw)] flex-col gap-3 overflow-y-auto rounded-t-2xl border border-[#c9a227]/35 bg-[#070b14] p-3 shadow-[0_0_80px_rgba(0,0,0,0.65)] sm:max-h-[94vh] sm:gap-4 sm:rounded-2xl sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-[#E6C15A]">
              MVP graphics
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Same width as the standings boards · boy and girl separate PNGs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasBoy && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void downloadPng("boy")}
                className="rounded-lg border border-[#c9a227]/50 bg-gradient-to-b from-[#3a3018] to-[#1a150a] px-4 py-2.5 text-sm font-semibold text-[#fff3cc] shadow-[0_0_24px_rgba(201,162,39,0.25)] hover:from-[#4a3f22] hover:to-[#221c0e] disabled:cursor-wait disabled:opacity-60"
              >
                {downloading === "boy" ? "Rendering…" : "Download boy MVP"}
              </button>
            )}
            {hasGirl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void downloadPng("girl")}
                className="rounded-lg border border-[#c9a227]/40 bg-[#1a150a]/80 px-4 py-2.5 text-sm font-semibold text-[#e8d9a8] hover:border-[#c9a227]/50 disabled:cursor-wait disabled:opacity-60"
              >
                {downloading === "girl" ? "Rendering…" : "Download girl MVP"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line bg-canvas-overlay px-4 py-2.5 text-sm text-slate-200 hover:border-white/20"
            >
              Close
            </button>
          </div>
        </div>

        {!hasAny ? (
          <p className="rounded-lg border border-warn/30 bg-warn/10 px-4 py-4 text-sm text-warn">
            Log elims in Live console and mark players as Boy or Girl on Teams to generate MVP
            graphics.
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: PREVIEW_GAP_PX }}>
            {hasBoy && (
              <MvpGraphicPreview label="Boy MVP" contentHeight={boyHeight}>
                <MvpGraphic ref={boyRef} {...slotToProps(tournamentName, boy, "boy")} />
              </MvpGraphicPreview>
            )}
            {hasGirl && (
              <MvpGraphicPreview label="Girl MVP" contentHeight={girlHeight}>
                <MvpGraphic ref={girlRef} {...slotToProps(tournamentName, girl, "girl")} />
              </MvpGraphicPreview>
            )}
            {hasBoy && !hasGirl && (
              <p className="text-sm text-slate-500">
                Girl MVP will appear when a girl player has elims logged.
              </p>
            )}
            {hasGirl && !hasBoy && (
              <p className="text-sm text-slate-500">
                Boy MVP will appear when a boy player has elims logged.
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
