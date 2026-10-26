import type { MarkPoint, PointResult } from "./types";

// The AI proposes marks; these deterministic rules check them against how
// Cambridge marking actually works. This is what stops the AI from being
// generous, inventing evidence, or breaking mark-scheme logic.

export type AiPoint = {
  id: string;
  type?: string;
  max_marks?: number;
  description?: string;
  awarded: number;
  evidence: string;
  reason: string;
};

/** For an A mark with no explicit dependency, Cambridge convention is that it
 *  depends on the nearest M mark before it. */
export function defaultDependencies(scheme: MarkPoint[]): MarkPoint[] {
  return scheme.map((p, i) => {
    if (p.type !== "A" || (p.dependsOn && p.dependsOn.length)) return p;
    for (let j = i - 1; j >= 0; j--) {
      if (scheme[j].type === "M") return { ...p, dependsOn: [scheme[j].id] };
    }
    return p;
  });
}

/** Turns a mark scheme the AI read from pasted text into our MarkPoint shape. */
export function schemeFromAi(points: AiPoint[]): MarkPoint[] {
  const seen = new Set<string>();
  const scheme: MarkPoint[] = [];
  for (const p of points) {
    let id = String(p.id || "").trim() || `P${scheme.length + 1}`;
    while (seen.has(id.toLowerCase())) id = `${id}′`;
    seen.add(id.toLowerCase());
    const t = String(p.type || id[0] || "B").toUpperCase();
    const type = (t === "M" || t === "A" ? t : "B") as MarkPoint["type"];
    const marks = Math.max(1, Math.min(10, Math.round(Number(p.max_marks) || 1)));
    scheme.push({ id, type, marks, description: String(p.description || "") });
  }
  return scheme;
}

export function applyRules(
  schemeIn: MarkPoint[],
  aiPoints: AiPoint[],
  totalMarks?: number,
): { points: PointResult[]; score: number; maxScore: number; adjustments: number } {
  const scheme = defaultDependencies(schemeIn);
  const byId = new Map(aiPoints.map((p) => [String(p.id).trim().toLowerCase(), p]));
  const results: PointResult[] = [];
  let adjustments = 0;

  for (const point of scheme) {
    const ai = byId.get(point.id.toLowerCase());
    const r: PointResult = {
      id: point.id,
      type: point.type,
      maxMarks: point.marks,
      description: point.description,
      awarded: 0,
      evidence: ai?.evidence?.trim() ?? "",
      reason: ai?.reason?.trim() ?? "",
    };

    if (!ai) {
      r.reason = "This point was not assessed.";
      r.adjustedByRules = "Missing from the marker's output, so no mark was given.";
      adjustments++;
      results.push(r);
      continue;
    }

    // 1. Marks must be a whole number between 0 and the point's maximum.
    const raw = Number(ai.awarded);
    const clamped = Number.isFinite(raw) ? Math.max(0, Math.min(point.marks, Math.round(raw))) : 0;
    if (clamped !== raw) {
      r.adjustedByRules = `Marker gave ${ai.awarded}; corrected to the allowed range 0–${point.marks}.`;
      adjustments++;
    }
    r.awarded = clamped;

    // 2. No evidence, no mark.
    if (r.awarded > 0 && r.evidence.length === 0) {
      r.awarded = 0;
      r.adjustedByRules = "No working was quoted to support this mark, so it was withheld.";
      adjustments++;
    }

    // 3. An A mark can't be earned without the method mark(s) it depends on.
    if (point.type === "A" && r.awarded > 0 && point.dependsOn?.length) {
      const missing = point.dependsOn.filter((dep) => {
        const d = results.find((x) => x.id.toLowerCase() === dep.toLowerCase());
        return !d || d.awarded < d.maxMarks;
      });
      if (missing.length) {
        r.awarded = 0;
        r.adjustedByRules = `Accuracy marks need the method mark first (${missing.join(", ")} not earned).`;
        adjustments++;
      }
    }

    results.push(r);
  }

  const maxScore = totalMarks ?? scheme.reduce((s, p) => s + p.marks, 0);
  const score = Math.min(maxScore, results.reduce((s, p) => s + p.awarded, 0));
  return { points: results, score, maxScore, adjustments };
}
