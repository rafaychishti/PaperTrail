import { NextResponse } from "next/server";
import { db, isValidAnonId } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

export async function GET(req: Request) {
  const anonId = new URL(req.url).searchParams.get("anon");
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    console.error("attempts auth check failed", error);
    return NextResponse.json({ error: "Couldn't verify your sign-in." }, { status: 503 });
  }
  if (!isValidAnonId(anonId) && !user) {
    return NextResponse.json({ error: "Your browser ID is missing or invalid." }, { status: 400 });
  }
  const supabase = db();
  if (!supabase) return NextResponse.json({ attempts: [], storage: "off" });

  let query = supabase
    .from("attempts")
    .select("id, question_id, topic, score, max_score, confidence, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (user && isValidAnonId(anonId)) {
    query = query.or(`user_id.eq.${user.id},anon_id.eq.${anonId}`);
  } else if (user) {
    query = query.eq("user_id", user.id);
  } else if (isValidAnonId(anonId)) {
    query = query.eq("anon_id", anonId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("attempts load failed", error.message);
    return NextResponse.json({ error: "Couldn't load your saved progress." }, { status: 503 });
  }
  return NextResponse.json({ attempts: data.reverse() }, { headers: { "Cache-Control": "no-store" } });
}
