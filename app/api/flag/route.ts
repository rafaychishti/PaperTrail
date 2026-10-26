import { NextResponse } from "next/server";
import { db, isValidAnonId } from "@/lib/supabase";

// "I think this mark is wrong" — students can challenge any mark. Flags are
// reviewed by a teacher and used to measure and improve marking accuracy.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { attemptId, anonId, pointId } = body as Record<string, unknown>;
  const note = String(body?.note ?? "").slice(0, 500);
  if (typeof attemptId !== "string" || !isValidAnonId(anonId) || typeof pointId !== "string") {
    return NextResponse.json({ error: "Missing details for this flag." }, { status: 400 });
  }
  const supabase = db();
  if (!supabase) return NextResponse.json({ ok: true, stored: false });

  // Only the student who made the attempt can flag it.
  const { data: owner } = await supabase.from("attempts").select("anon_id").eq("id", attemptId).maybeSingle();
  if (!owner || owner.anon_id !== anonId) {
    return NextResponse.json({ error: "That attempt wasn't found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("flags")
    .insert({ attempt_id: attemptId, anon_id: anonId, point_id: pointId.slice(0, 20), note });
  if (error) return NextResponse.json({ error: "Couldn't save the flag." }, { status: 500 });
  return NextResponse.json({ ok: true, stored: true });
}
