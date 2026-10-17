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
  measureGraphicExportHeight,
  slugifyFilename,
} from "../lib/graphicCapture";
import {
  FINAL_STAGE_EXPORT_MAX_H,
  RESULTS_EXPORT_MAX_H,
  RESULTS_EXPORT_W,
} from "../lib/graphicTheme";
import { standingsGraphicMeta } from "../lib/standingsGraphicMeta";
import { activeStage, matchesInStage, stageById, stagesEnabled, teamsInStage } from "../lib/stages";
import { FastResGraphic } from "./FastResGraphic";
import { FinalStageGraphic } from "./FinalStageGraphic";

const PREVIEW_SCALE = 0.42;
const PREVIEW_GAP_PX = 40;

type GraphicVariant = "final" | "fastres";

function GraphicPreview({
  label,
  contentHeight,
  previewInnerRef,
  exportWidth = RESULTS_EXPORT_W,
  children,
}: {
  label: string;
  contentHeight: number;
  previewInnerRef: React.RefObject<HTMLDivElement | null>;
  exportWidth?: number;
  children: React.ReactNode;
}) {
  const scale = (RESULTS_EXPORT_W * PREVIEW_SCALE) / exportWidth;
  const previewW = exportWidth * scale;
  const previewH = contentHeight * scale;

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
              ref={previewInnerRef}
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: exportWidth, transform: `scale(${scale})` }}
            >
              {children}
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
  stageId,
}: {
  open: boolean;
  onClose: () => void;
  tournament: Tournament;
  /** Group or finals to export. Omit to use the active stage, or the whole field when groups are off. */
  stageId?: string | null;
}) {
  const finalRef = useRef<HTMLDivElement>(null);
  const fastResRef = useRef<HTMLDivElement>(null);
  const finalPreviewInnerRef = useRef<HTMLDivElement>(null);
  const fastResPreviewInnerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<GraphicVariant | null>(null);
  const [finalHeight, setFinalHeight] = useState(RESULTS_EXPORT_MAX_H);
  const [fastResHeight, setFastResHeight] = useState(RESULTS_EXPORT_MAX_H);
  const view = useMemo(() => {
    const stage = stagesEnabled(tournament)
      ? stageById(tournament, stageId) ?? activeStage(tournament)
      : null;
    if (!stage) {
      return {
        teams: tournament.teams,
        matches: tournament.matches,
        title: tournament.name,
        heading: "Եզրափակիչ փուլ",
        fileTag: "",
      };
    }
    return {
      teams: teamsInStage(tournament, stage),
      matches: matchesInStage(tournament, stage),
      title: tournament.name,
      heading: stage.kind === "group" ? stage.name : "Եզրափակիչ փուլ",
      fileTag: stage.name,
    };
  }, [tournament, stageId]);
  const rows = useMemo(
    () => computeStandings(view.teams, view.matches),
    [view.teams, view.matches],
  );

  const finalStageProps = useMemo(() => {
    const meta = standingsGraphicMeta(view.matches);
    return {
      tournamentName: view.title,
      heading: view.heading,
      rows,
      matchCurrent: meta.matchCurrent,
      matchTotal: meta.matchTotal,
    };
  }, [view.title, view.heading, view.matches, rows]);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      setFinalHeight(measureGraphicExportHeight(finalRef.current, FINAL_STAGE_EXPORT_MAX_H));
      setFastResHeight(measureGraphicExportHeight(fastResRef.current, FINAL_STAGE_EXPORT_MAX_H));
    };
    measure();
    const nodes = [finalRef.current, fastResRef.current].filter(Boolean) as HTMLElement[];
    const ro = new ResizeObserver(measure);
    for (const n of nodes) ro.observe(n);
    return () => ro.disconnect();
  }, [open, tournament, stageId, finalStageProps]);

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
      const el = variant === "final" ? finalRef.current : fastResRef.current;
      if (!el) return;
      setDownloading(variant);
      try {
        const exportH = measureGraphicExportHeight(el, FINAL_STAGE_EXPORT_MAX_H);
        const blob = await captureVisibleGraphic(el, RESULTS_EXPORT_W, exportH);
        const stamp = new Date().toISOString().slice(0, 10);
        const base = slugifyFilename(tournament.name) || "standings";
        const stageSlug = slugifyFilename(view.fileTag);
        const suffix = variant === "final" ? "photo" : "fast_res";
        const parts = [base, stageSlug, suffix, stamp].filter(Boolean);
        downloadPngBlob(blob, `${parts.join("_")}.jpg`);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Download failed. Try again in a moment.");
      } finally {
        setDownloading(null);
      }
    },
    [tournament.name, view.fileTag],
  );

  if (!open) return null;

  const busy = downloading != null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Standings graphics"
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
              Standings graphics
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              {view.title} · Photo poster · FAST RES
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void downloadPng("final")}
              className="rounded-lg border border-[#c9a227]/50 bg-gradient-to-b from-[#3a3018] to-[#1a150a] px-4 py-2.5 text-sm font-semibold text-[#fff3cc] shadow-[0_0_24px_rgba(201,162,39,0.25)] hover:from-[#4a3f22] hover:to-[#221c0e] disabled:cursor-wait disabled:opacity-60"
            >
              {downloading === "final" ? "Rendering…" : "Download photo"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void downloadPng("fastres")}
              className="rounded-lg border border-cyan-400/40 bg-[#062033] px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:border-cyan-300/60 disabled:cursor-wait disabled:opacity-60"
            >
              {downloading === "fastres" ? "Rendering…" : "Download FAST RES"}
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
          <GraphicPreview
            label="Photo poster"
            contentHeight={finalHeight}
            previewInnerRef={finalPreviewInnerRef}
          >
            <FinalStageGraphic ref={finalRef} {...finalStageProps} />
          </GraphicPreview>

          <GraphicPreview
            label="FAST RES"
            contentHeight={fastResHeight}
            previewInnerRef={fastResPreviewInnerRef}
          >
            <FastResGraphic ref={fastResRef} {...finalStageProps} />
          </GraphicPreview>
        </div>
      </div>
    </div>,
    document.body,
  );
}
