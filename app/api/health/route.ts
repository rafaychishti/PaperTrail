import { NextResponse } from "next/server";
import { isDemo } from "@/lib/mode";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = db();
  const mode = isDemo() ? "demo" : "ai";
  if (!supabase) {
    return NextResponse.json({ status: "ok", mode, storage: "off" });
  }

  const { error } = await supabase.from("attempts").select("id").limit(1);
  if (error) {
    console.error("health check failed", error.message);
    return NextResponse.json({ status: "degraded", mode, storage: "unavailable" }, { status: 503 });
  }
  return NextResponse.json({ status: "ok", mode, storage: "connected" });
}
