const MAX_INPUT_BYTES = 8 * 1024 * 1024;
/** Longest edge kept so a 6× PNG export still has a sharp logo. */
const MAX_OUTPUT_SIDE = 512;
/** Soft cap on serialized logo size (~520 KB base64). */
const MAX_DATA_URL_CHARS = 700_000;

function drawLogo(
  bitmap: ImageBitmap,
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

    let dataUrl = canvas.toDataURL("image/png");
    if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;

    dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;

    const smaller = drawLogo(bitmap, Math.round(MAX_OUTPUT_SIDE * 0.7));
    dataUrl = smaller.canvas.toDataURL("image/jpeg", 0.9);
    if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;

    throw new Error(
      "That image is still too large after compression. Try a smaller or simpler logo.",
    );
  } finally {
    bitmap.close();
  }
}
