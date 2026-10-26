import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client. The service key never reaches the browser, and the
// tables have row-level security on with no public policies, so the only way
// in is through our API routes.
let client: SupabaseClient | null | undefined;

export function db(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function isValidAnonId(id: unknown): id is string {
  return typeof id === "string" && /^[a-z0-9-]{8,64}$/i.test(id);
}
