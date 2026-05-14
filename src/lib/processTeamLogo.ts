const MAX_INPUT_BYTES = 4 * 1024 * 1024;
/** Longest edge after resize — keeps exports and localStorage reasonable */
const MAX_OUTPUT_SIDE = 192;
/** Soft cap on serialized logo size (~260 KB base64) */
const MAX_DATA_URL_CHARS = 350_000;

function dataUrlFromCanvas(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Reads an image file, downscales, and returns a JPEG data URL suitable for `Team.logoDataUrl`.
 */
export async function processTeamLogoFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (PNG, JPG, WebP, etc.).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Image must be 4 MB or smaller.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const w = bitmap.width;
    const h = bitmap.height;
    const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process image in this browser.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, cw, ch);

    let dataUrl = dataUrlFromCanvas(canvas, 0.82);
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      dataUrl = dataUrlFromCanvas(canvas, 0.68);
    }
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      const s = 0.72;
      canvas.width = Math.max(1, Math.round(cw * s));
      canvas.height = Math.max(1, Math.round(ch * s));
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      dataUrl = dataUrlFromCanvas(canvas, 0.72);
    }
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      throw new Error(
        "That image is still too large after compression. Try a smaller or simpler logo.",
      );
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
