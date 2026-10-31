import { createServerClient } from "@supabase/ssr";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { safeReturnPath } from "@/lib/auth-utils";

export { safeReturnPath };

export async function createAuthClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; proxy.ts refreshes sessions before rendering.
        }
      },
    },
  });
}

export async function getAuthenticatedUser() {
  const supabase = await createAuthClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error instanceof AuthSessionMissingError) return null;
  if (error) throw error;
  return data.user;
}
