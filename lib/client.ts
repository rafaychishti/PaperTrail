"use client";

// Browser helpers: an anonymous id per browser, and photo resizing.

export function getAnonId(): string {
  try {
    let id = localStorage.getItem("pt-anon");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("pt-anon", id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Shrinks a photo to at most 1600px on its long side and returns base64 JPEG. */
export async function resizePhoto(file: File): Promise<{ mediaType: "image/jpeg"; data: string; preview: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That file isn't an image we can read."));
      el.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL("image/jpeg", 0.85);
    return { mediaType: "image/jpeg", data: preview.split(",")[1], preview };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** When the database isn't set up (e.g. in demo mode), progress is kept in
 *  this browser instead, so the progress page still works. */
export type LocalAttempt = { id: string; question_id: string; topic: string; score: number; max_score: number; created_at: string };

export function saveLocalAttempt(a: Omit<LocalAttempt, "id" | "created_at">) {
  try {
    const list = getLocalAttempts();
    list.push({ ...a, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    localStorage.setItem("pt-attempts", JSON.stringify(list.slice(-200)));
  } catch {
    /* storage unavailable: progress just isn't kept */
  }
}

export function getLocalAttempts(): LocalAttempt[] {
  try {
    const raw = JSON.parse(localStorage.getItem("pt-attempts") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}
