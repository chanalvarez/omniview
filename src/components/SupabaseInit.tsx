"use client";

import { createOmniViewSupabaseClient } from "@/lib/supabase/client";
import { useEffect } from "react";

/**
 * Warms the Supabase client on the dashboard shell so auth/session and
 * multi-tenant wiring are ready for future data hooks.
 */
export function SupabaseInit() {
  useEffect(() => {
    const supabase = createOmniViewSupabaseClient();
    void supabase.auth.getSession();
  }, []);
  return null;
}
