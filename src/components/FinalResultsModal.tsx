import html2canvas from "html2canvas";
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
import { FinalResultsGraphic } from "./FinalResultsGraphic";

const EXPORT_W = 1920;
const EXPORT_MIN_H = 1080;
const PREVIEW_SCALE = 0.42;

function slugify(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 48);
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
  const captureRef = useRef<HTMLDivElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewH, setPreviewH] = useState(EXPORT_MIN_H * PREVIEW_SCALE);

  const graphicProps = useMemo(() => {
    const rows = computeStandings(tournament.teams, tournament.matches);
    return {
      tournamentName: tournament.name,
      rows,
    };
  }, [tournament]);

  useLayoutEffect(() => {
    if (!open) return;
    const inner = previewInnerRef.current;
    if (!inner) return;
    const update = () => {
      const h = inner.offsetHeight * PREVIEW_SCALE;
      setPreviewH(Math.max(EXPORT_MIN_H * PREVIEW_SCALE, Math.ceil(h) + 4));
    };
    update();
    const id = requestAnimationFrame(update);
    const ro = new ResizeObserver(update);
    ro.observe(inner);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
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

  const downloadPng = useCallback(async () => {
    const el = captureRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const canvas = await html2canvas(el, {
        scale: 2,
        logging: false,
        backgroundColor: "#03060c",
        useCORS: true,
        allowTaint: false,
        imageTimeout: 20000,
      });
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create image."));
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const stamp = new Date().toISOString().slice(0, 10);
            const base = slugify(tournament.name) || "group_stage_results";
            a.href = url;
            a.download = `${base}_group_stage_results_${stamp}.png`;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          },
          "image/png",
          1,
        );
      });
    } catch (e) {
      alert(
        e instanceof Error ? e.message : "Download failed. Try again in a moment.",
      );
    } finally {
      setDownloading(false);
    }
  }, [tournament.name]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Group stage results graphic"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-[min(1240px,100vw)] flex-col gap-4 rounded-2xl border border-[#c9a227]/35 bg-[#070b14] p-5 shadow-[0_0_80px_rgba(0,0,0,0.65)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-[#f0dc93]">
              Group stage results graphic
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              1920px wide · two-column survival-style board · PNG height grows with roster size.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={downloading}
              onClick={() => void downloadPng()}
              className="rounded-lg border border-[#c9a227]/50 bg-gradient-to-b from-[#3a3018] to-[#1a150a] px-4 py-2.5 text-sm font-semibold text-[#fff3cc] shadow-[0_0_24px_rgba(201,162,39,0.25)] hover:from-[#4a3f22] hover:to-[#221c0e] disabled:cursor-wait disabled:opacity-60"
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

        <div className="mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl ring-1 ring-[#c9a227]/20">
          <div
            className="mx-auto max-h-[min(82vh,900px)] overflow-auto bg-black py-1"
            style={{
              width: EXPORT_W * PREVIEW_SCALE + 8,
            }}
          >
            {/* Sized to scaled visual bounds so overflow matches what you see (transform alone still lays out at 1:1). */}
            <div
              className="relative mx-auto overflow-hidden"
              style={{
                width: EXPORT_W * PREVIEW_SCALE,
                height: previewH,
              }}
            >
              <div
                ref={previewInnerRef}
                className="absolute left-0 top-0 origin-top-left"
                style={{
                  width: EXPORT_W,
                  transform: `scale(${PREVIEW_SCALE})`,
                }}
              >
                <FinalResultsGraphic {...graphicProps} />
              </div>
            </div>
          </div>
        </div>

        <div
          className="fixed top-0 overflow-visible"
          style={{ left: "-12000px", width: EXPORT_W, minHeight: EXPORT_MIN_H }}
          aria-hidden="true"
        >
          <FinalResultsGraphic ref={captureRef} {...graphicProps} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
