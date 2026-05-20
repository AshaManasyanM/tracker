import html2canvas from "html2canvas";

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

export async function captureElementToPngBlob(
  el: HTMLElement,
  width: number,
  height: number,
): Promise<Blob> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await waitForGraphicImages(el);
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  const canvas = await html2canvas(el, {
    scale: 2,
    logging: false,
    backgroundColor: "#070b14",
    useCORS: true,
    allowTaint: false,
    imageTimeout: 20000,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scrollX: 0,
    scrollY: 0,
    onclone: (_doc, cloned) => {
      cloned.style.lineHeight = "normal";
    },
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not create image."));
          return;
        }
        resolve(blob);
      },
      "image/png",
      1,
    );
  });
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
