import { NextResponse, type NextRequest } from "next/server";
import { createAuthClient, safeReturnPath } from "@/lib/supabase-auth";

export async function GET(request: NextRequest) {
  const supabase = await createAuthClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=auth_unavailable", request.url));
  }

  const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });
  if (error || !data.url) {
    console.error("Google sign-in start failed", error?.message ?? "No authorization URL returned.");
    return NextResponse.redirect(new URL("/login?error=provider_unavailable", request.url));
  }

  return NextResponse.redirect(data.url);
}
