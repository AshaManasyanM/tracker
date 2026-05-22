import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Tournament } from "../types/tournament";
import { computeStandings } from "../lib/standings";
import {
  captureVisibleGraphic,
  downloadPngBlob,
  slugifyFilename,
} from "../lib/graphicCapture";
import { GRAPHIC_OFFICIAL_BG } from "../lib/graphicTheme";
import { FinalResultsGraphic } from "./FinalResultsGraphic";
import { FinalResultsGraphicOfficial } from "./FinalResultsGraphicOfficial";

/** Header label on the branded PNG (display only) */
const GRAPHIC_LABEL_DAY = 2;

const EXPORT_W = 1920;
const EXPORT_MIN_H = 1080;
const PREVIEW_SCALE = 0.42;
const PREVIEW_GAP_PX = 40;

type GraphicVariant = "branded" | "official";

function GraphicPreview({
  label,
  previewInnerRef,
  children,
}: {
  label: string;
  previewInnerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const previewW = EXPORT_W * PREVIEW_SCALE;
  const previewH = EXPORT_MIN_H * PREVIEW_SCALE;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="w-full overflow-x-auto overscroll-x-contain py-1 [-webkit-overflow-scrolling:touch]">
          <div
            className="mx-auto max-h-[min(55dvh,520px)] overflow-y-auto sm:max-h-[min(60vh,560px)]"
            style={{ width: previewW + 8 }}
          >
            <div
              className="relative mx-auto overflow-hidden"
              style={{ width: previewW, minHeight: previewH }}
            >
              <div
                ref={previewInnerRef}
                className="absolute left-0 top-0 origin-top-left"
                style={{ width: EXPORT_W, transform: `scale(${PREVIEW_SCALE})` }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinalResultsModal({
  open,
  onClose,
  tournament,
}: {
  open: boolean;
  onClose: () => void;
  tournament: Tournament;
}) {
  const brandedRef = useRef<HTMLDivElement>(null);
  const officialRef = useRef<HTMLDivElement>(null);
  const brandedPreviewInnerRef = useRef<HTMLDivElement>(null);
  const officialPreviewInnerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<GraphicVariant | null>(null);

  const graphicProps = useMemo(() => {
    const rows = computeStandings(tournament.teams, tournament.matches);
    return {
      tournamentName: tournament.name,
      rows,
      day: GRAPHIC_LABEL_DAY,
    };
  }, [tournament]);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      /* previews use min-height; scroll handles overflow */
    };
    update();
    const nodes = [brandedPreviewInnerRef.current, officialPreviewInnerRef.current].filter(
      Boolean,
    ) as HTMLElement[];
    const ro = new ResizeObserver(update);
    for (const n of nodes) ro.observe(n);
    return () => ro.disconnect();
  }, [open, tournament]);

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
    async (variant: GraphicVariant) => {
      const el = variant === "branded" ? brandedRef.current : officialRef.current;
      if (!el) return;
      setDownloading(variant);
      try {
        const exportH = Math.max(EXPORT_MIN_H, el.offsetHeight);
        const bg = variant === "official" ? GRAPHIC_OFFICIAL_BG : undefined;
        const blob = await captureVisibleGraphic(el, EXPORT_W, exportH, bg);
        const stamp = new Date().toISOString().slice(0, 10);
        const base = slugifyFilename(tournament.name) || "group_stage";
        const suffix =
          variant === "branded"
            ? `group_stage_day${GRAPHIC_LABEL_DAY}`
            : "group_stage_official";
        downloadPngBlob(blob, `${base}_${suffix}_${stamp}.png`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Download failed. Try again in a moment.");
      } finally {
        setDownloading(null);
      }
    },
    [tournament.name],
  );

  if (!open) return null;

  const busy = downloading != null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Group stage results graphic"
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
              Group stage results graphic
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Two styles · same Live standings data · 1920px wide PNGs
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void downloadPng("branded")}
              className="rounded-lg border border-[#c9a227]/50 bg-gradient-to-b from-[#3a3018] to-[#1a150a] px-4 py-2.5 text-sm font-semibold text-[#fff3cc] shadow-[0_0_24px_rgba(201,162,39,0.25)] hover:from-[#4a3f22] hover:to-[#221c0e] disabled:cursor-wait disabled:opacity-60"
            >
              {downloading === "branded" ? "Rendering…" : "Download branded"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void downloadPng("official")}
              className="rounded-lg border border-line bg-canvas-overlay px-4 py-2.5 text-sm font-semibold text-slate-100 hover:border-white/20 disabled:cursor-wait disabled:opacity-60"
            >
              {downloading === "official" ? "Rendering…" : "Download official"}
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

        <div className="flex flex-col" style={{ gap: PREVIEW_GAP_PX }}>
          <GraphicPreview label="Branded — logo & Day 2" previewInnerRef={brandedPreviewInnerRef}>
            <FinalResultsGraphic ref={brandedRef} {...graphicProps} />
          </GraphicPreview>

          <GraphicPreview
            label="Official standings — broadcast style"
            previewInnerRef={officialPreviewInnerRef}
          >
            <FinalResultsGraphicOfficial ref={officialRef} {...graphicProps} />
          </GraphicPreview>
        </div>
      </div>
    </div>,
    document.body,
  );
}
