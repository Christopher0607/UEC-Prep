/**
 * localStorage gives us roughly 5MB for everything, and a raw phone photo is
 * 3–5MB on its own. Downscale to something still readable as a question and
 * store it as a JPEG data URL, so the whole app stays backend-free.
 */
const MAX_EDGE = 1280;
const QUALITY = 0.7;

/** Past-paper scans need to stay readable, so they get more pixels. */
export const PAPER_EDGE = 2000;
export const PAPER_QUALITY = 0.8;

export function compressImage(file: File, maxEdge = MAX_EDGE, quality = QUALITY): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not decode image"));
    };
    img.src = url;
  });
}
