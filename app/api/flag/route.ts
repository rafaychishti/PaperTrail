import { NextResponse } from "next/server";
import { db, isValidAnonId } from "@/lib/supabase";
import { readJsonObject } from "@/lib/request";

// "I think this mark is wrong" — students can challenge any mark. Flags are
// reviewed by a teacher and used to measure and improve marking accuracy.
export async function POST(req: Request) {
  const parsed = await readJsonObject(req, 4_000);
  if (parsed.error) {
    return NextResponse.json({ error: "The request could not be read." }, { status: parsed.error === "too_large" ? 413 : 400 });
  }
  const { attemptId, anonId, pointId, note: rawNote } = parsed.body;
  const note = typeof rawNote === "string" ? rawNote : "";
  if (
    typeof attemptId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(attemptId) ||
    !isValidAnonId(anonId) ||
    typeof pointId !== "string" ||
    !/^[a-z][a-z0-9]{0,19}$/i.test(pointId) ||
    note.length > 500 ||
    (rawNote !== undefined && typeof rawNote !== "string")
  ) {
    return NextResponse.json({ error: "Missing details for this flag." }, { status: 400 });
  }
  const supabase = db();
  if (!supabase) return NextResponse.json({ error: "Progress storage is not configured." }, { status: 503 });

  // Only the student who made the attempt can flag it.
  const { data: attempt, error: lookupError } = await supabase
    .from("attempts")
    .select("anon_id, result")
    .eq("id", attemptId)
    .maybeSingle();
  if (lookupError) {
    console.error("flag lookup failed", lookupError.message);
    return NextResponse.json({ error: "Couldn't verify that attempt." }, { status: 503 });
  }
  if (!attempt || attempt.anon_id !== anonId) {
    return NextResponse.json({ error: "That attempt wasn't found." }, { status: 404 });
  }
  const points = (attempt.result as { points?: unknown } | null)?.points;
  if (!Array.isArray(points) || !points.some((point) => point && typeof point === "object" && point.id === pointId)) {
    return NextResponse.json({ error: "That mark point wasn't found." }, { status: 404 });
  }

  const { data: existingFlag, error: existingError } = await supabase
    .from("flags")
    .select("id")
    .eq("attempt_id", attemptId)
    .eq("anon_id", anonId)
    .eq("point_id", pointId)
    .maybeSingle();
  if (existingError) {
    console.error("flag lookup failed", existingError.message);
    return NextResponse.json({ error: "Couldn't check whether this mark was already flagged." }, { status: 503 });
  }
  if (existingFlag) return NextResponse.json({ ok: true, stored: true });

  const { error } = await supabase
    .from("flags")
    .insert({ attempt_id: attemptId, anon_id: anonId, point_id: pointId.slice(0, 20), note });
  if (error) {
    console.error("flag save failed", error.message);
    return NextResponse.json({ error: "Couldn't save the flag." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
