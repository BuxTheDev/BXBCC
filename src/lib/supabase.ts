import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isDemo = !SUPABASE_URL || !SUPABASE_ANON;

/** Server-side client (service role if provided, else anon). */
export function serverClient(): SupabaseClient | null {
  if (isDemo) return null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}

export function browserClient(): SupabaseClient | null {
  if (isDemo) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}
