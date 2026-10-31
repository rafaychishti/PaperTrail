import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient, safeReturnPath } from "@/lib/supabase-auth";

export async function GET(request: NextRequest) {
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const code = request.nextUrl.searchParams.get("code");
  const supabase = await createAuthClient();
  if (!supabase || !code) {
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Google sign-in callback failed", error.message);
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
