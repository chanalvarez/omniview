import { supabaseRestHeaders } from "@/lib/integrations/supabase-rest-headers";

/**
 * Pings the PostgREST OpenAPI endpoint (/rest/v1/) to verify that both the
 * base URL and the API key are valid. Returns 200 when Supabase can be reached
 * and the key is accepted.
 */
export async function pingExternalMetrics(
  baseUrl: string,
  apiKey: string,
): Promise<{ ok: true } | { ok: false; status?: number; reason: "http" | "network" }> {
  const base = baseUrl.replace(/\/+$/, "");
  const url = `${base}/rest/v1/`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: supabaseRestHeaders(apiKey),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (res.ok) return { ok: true };
    return { ok: false, status: res.status, reason: "http" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
