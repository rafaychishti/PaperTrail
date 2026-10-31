import { NextResponse } from "next/server";
import { db, isValidAnonId } from "@/lib/supabase";

export async function GET(req: Request) {
  const anonId = new URL(req.url).searchParams.get("anon");
  if (!isValidAnonId(anonId)) {
    return NextResponse.json({ error: "Your browser ID is missing or invalid." }, { status: 400 });
  }
  const supabase = db();
  if (!supabase) return NextResponse.json({ attempts: [], storage: "off" });

  const { data, error } = await supabase
    .from("attempts")
    .select("id, question_id, topic, score, max_score, confidence, created_at")
    .eq("anon_id", anonId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("attempts load failed", error.message);
    return NextResponse.json({ error: "Couldn't load your saved progress." }, { status: 503 });
  }
  return NextResponse.json({ attempts: data.reverse() }, { headers: { "Cache-Control": "no-store" } });
}
