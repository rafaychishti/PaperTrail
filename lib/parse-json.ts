import type { MarkResult } from "./types.ts";
import type { AiPoint } from "./rules.ts";

export type Parsed = {
  points: AiPoint[];
  summary: string;
  next_step: string;
  confidence: MarkResult["confidence"];
  reading_issues: string;
};

/** Open models sometimes wrap JSON in ``` fences or add a sentence; pull out the object. */
export function parseMarkerJson(text: string): Parsed {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The marker's reply wasn't valid JSON.");
  const p = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(p.points)) throw new Error("The marker's reply had no mark points.");
  const conf = ["high", "medium", "low"].includes(p.confidence) ? p.confidence : "low";
  return {
    points: p.points,
    summary: String(p.summary ?? ""),
    next_step: String(p.next_step ?? ""),
    confidence: conf,
    reading_issues: String(p.reading_issues ?? ""),
  };
}

