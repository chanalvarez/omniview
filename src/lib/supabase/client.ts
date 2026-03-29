import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Browser Supabase client for the OmniView multi-tenant dashboard.
 * Uses public anon key — enforce tenant scoping in RLS policies on your project.
 */
export function createOmniViewSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "OmniView Supabase: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.",
    );
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
