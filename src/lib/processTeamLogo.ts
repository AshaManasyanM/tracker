const MAX_INPUT_BYTES = 8 * 1024 * 1024;
/**
 * Longest edge kept. Logos render at ~32 px on the boards, i.e. ~160 px in a 5× export,
 * so 256 px stays sharp while keeping the tournament JSON small enough to save quickly.
 */
const MAX_OUTPUT_SIDE = 256;
/** Soft cap on serialized logo size (~90 KB base64). */
const MAX_DATA_URL_CHARS = 120_000;
/** Logos at or under this size are left untouched when shrinking existing data. */
const SHRINK_THRESHOLD_CHARS = 80_000;

function drawLogo(
  bitmap: CanvasImageSource & { width: number; height: number },
  maxSide: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
}

/**
 * Reads an image file and returns a data URL for `Team.logoDataUrl`.
 * PNG keeps edges and transparency; JPEG is only a fallback when the file is large.
 */
export async function processTeamLogoFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, WebP, etc.).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Image must be 8 MB or smaller.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const { canvas } = drawLogo(bitmap, MAX_OUTPUT_SIDE);

    const dataUrl = encodeCompact(canvas);
    if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;

    const smaller = drawLogo(bitmap, Math.round(MAX_OUTPUT_SIDE * 0.7));
    const small = encodeCompact(smaller.canvas);
    if (small.length <= MAX_DATA_URL_CHARS) return small;

    throw new Error(
      "That image is still too large after compression. Try a smaller or simpler logo.",
    );
  } finally {
    bitmap.close();
  }
}

/** PNG (keeps transparency) → WebP (keeps transparency, smaller) → JPEG fallback. */
function encodeCompact(canvas: HTMLCanvasElement): string {
  const png = canvas.toDataURL("image/png");
  if (png.length <= SHRINK_THRESHOLD_CHARS) return png;
  const webp = canvas.toDataURL("image/webp", 0.92);
  if (webp.startsWith("data:image/webp") && webp.length < png.length) {
    if (webp.length <= SHRINK_THRESHOLD_CHARS) return webp;
  }
  const jpeg = canvas.toDataURL("image/jpeg", 0.9);
  const best = [png, webp.startsWith("data:image/webp") ? webp : png, jpeg].reduce((a, b) =>
    b.length < a.length ? b : a,
  );
  return best;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("logo decode failed"));
    img.src = src;
  });
}

/**
 * Shrinks an existing oversized logo data URL to the current size limits.
 * Returns the original string unchanged if it is already small or cannot be decoded.
 */
export async function shrinkLogoDataUrl(dataUrl: string): Promise<string> {
  if (!dataUrl.startsWith("data:image/") || dataUrl.length <= SHRINK_THRESHOLD_CHARS) {
    return dataUrl;
  }
  try {
    const img = await loadImage(dataUrl);
    const { canvas } = drawLogo(
      Object.assign(img, { width: img.naturalWidth, height: img.naturalHeight }),
      MAX_OUTPUT_SIDE,
    );
    const out = encodeCompact(canvas);
    return out.length < dataUrl.length ? out : dataUrl;
  } catch {
    return dataUrl;
  }
}
