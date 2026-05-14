/**
 * Runs Tesseract OCR in the browser on a match result / leaderboard screenshot.
 * Dynamically imported so the main bundle stays smaller until this path is used.
 */
export async function recognizeMatchScreenshot(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const { createWorker, PSM } = await import("tesseract.js");
  const worker = await createWorker("eng+rus", 1, {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(Math.min(1, Math.max(0, m.progress)));
      }
    },
  });
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      user_defined_dpi: "300",
    });
    const {
      data: { text },
    } = await worker.recognize(file);
    return text ?? "";
  } finally {
    await worker.terminate();
  }
}
