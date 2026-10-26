import { NextResponse } from "next/server";
import { db, isValidAnonId } from "@/lib/supabase";

export async function GET(req: Request) {
  const anonId = new URL(req.url).searchParams.get("anon");
  if (!isValidAnonId(anonId)) return NextResponse.json({ attempts: [] });
  const supabase = db();
  if (!supabase) return NextResponse.json({ attempts: [], storage: "off" });

  const { data, error } = await supabase
    .from("attempts")
    .select("id, question_id, topic, score, max_score, confidence, created_at")
    .eq("anon_id", anonId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) return NextResponse.json({ error: "Couldn't load your progress." }, { status: 500 });
  return NextResponse.json({ attempts: data });
}
