"use server";

import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-auth";

export async function signOut() {
  const supabase = await createAuthClient();
  if (!supabase) redirect("/login?error=auth_unavailable");

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("sign out failed", error.message);
    redirect("/login?error=sign_out_failed");
  }
  redirect("/");
}
