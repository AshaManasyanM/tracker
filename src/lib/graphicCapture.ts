import { toBlob } from "html-to-image";
import { GRAPHIC_BG } from "./graphicTheme";

/** 6× keeps text and logos sharp when the board is posted or viewed large. */
const EXPORT_PIXEL_RATIO = 6;

export async function waitForGraphicImages(root: HTMLElement): Promise<void> {
  const imgs = [...root.querySelectorAll("img")];
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );
}

type StylePatch = {
  element: HTMLElement;
  previousCssText: string;
};

function applyStylePatch(element: HTMLElement, styles: Record<string, string>): StylePatch {
  const previousCssText = element.style.cssText;
  for (const [prop, value] of Object.entries(styles)) {
    element.style.setProperty(prop, value);
  }
  return { element, previousCssText };
}

function revertStylePatch(patch: StylePatch): void {
  patch.element.style.cssText = patch.previousCssText;
}

function findScaledWrapper(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const inline = node.style.transform;
    if (inline.includes("scale")) return node;
    const computed = getComputedStyle(node).transform;
    if (computed !== "none") {
      const m = computed.match(/^matrix\(([^)]+)\)$/);
      if (m) {
        const [a, , , d] = m[1].split(",").map((v) => Number.parseFloat(v.trim()));
        if (a !== 1 || d !== 1) return node;
      }
    }
    node = node.parentElement;
  }
  return null;
}

/** Capture the same on-screen preview node (unscales + unclips ancestors briefly). */
export async function captureVisibleGraphic(
  root: HTMLElement,
  width: number,
  height: number,
  backgroundColor: string = GRAPHIC_BG,
  pixelRatio: number = EXPORT_PIXEL_RATIO,
): Promise<Blob> {
  const patches: StylePatch[] = [];
  const scaled = findScaledWrapper(root);

  let ancestor: HTMLElement | null = root.parentElement;
  while (ancestor && ancestor !== document.body) {
    // Do not patch modal-level scroll containers — leaves overflow stuck after download.
    if (ancestor.dataset.graphicModalScroll != null) break;

    const cs = getComputedStyle(ancestor);
    const inlineW = ancestor.style.width;
    const parsedW = inlineW.endsWith("px") ? Number.parseFloat(inlineW) : 0;
    const clipBox = parsedW > 0 && parsedW < width - 1;

    const patch: Record<string, string> = {
      overflow: "visible",
      "overflow-x": "visible",
      "overflow-y": "visible",
      "max-height": "none",
    };
    if (clipBox) {
      patch.width = `${width}px`;
      patch.height = `${height}px`;
    } else if (cs.overflow !== "visible" || cs.maxHeight !== "none") {
      patch["max-height"] = "none";
    }
    patches.push(applyStylePatch(ancestor, patch));
    ancestor = ancestor.parentElement;
  }

  if (scaled) {
    patches.push(
      applyStylePatch(scaled, {
        transform: "none",
        position: "fixed",
        left: "0",
        top: "0",
        width: `${width}px`,
        height: `${height}px`,
        "z-index": "2147483646",
        margin: "0",
      }),
    );
  }

  patches.push(applyStylePatch(root, { transform: "none" }));

  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  try {
    return await captureElementToPngBlob(root, width, height, backgroundColor, pixelRatio);
  } finally {
    for (let i = patches.length - 1; i >= 0; i--) {
      revertStylePatch(patches[i]!);
    }
    requestAnimationFrame(() => {
      for (const el of patches) {
        void el.element.offsetHeight;
      }
    });
  }
}

export async function captureElementToPngBlob(
  el: HTMLElement,
  width: number,
  height: number,
  backgroundColor: string = GRAPHIC_BG,
  pixelRatio: number = EXPORT_PIXEL_RATIO,
): Promise<Blob> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await waitForGraphicImages(el);
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  const blob = await toBlob(el, {
    pixelRatio,
    backgroundColor,
    width,
    height,
    cacheBust: true,
    skipFonts: false,
    // Keep team logos intact (data URLs + narrow table cells).
    style: {
      overflow: "visible",
    },
  });

  if (!blob) {
    throw new Error("Could not create image.");
  }
  return blob;
}

export function downloadPngBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugifyFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 48);
}

/** Full rendered height for PNG export (not clipped by preview max-height). */
export function measureGraphicExportHeight(
  el: HTMLElement | null,
  maxHeight: number,
): number {
  if (!el) return maxHeight;
  const h = Math.ceil(
    Math.max(el.offsetHeight, el.scrollHeight, el.getBoundingClientRect().height),
  );
  // Small buffer avoids subpixel crop on footer / last row.
  return Math.min(maxHeight, Math.max(1, h + 4));
}
