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

  // Pass apikey both as a header AND as a URL param — PostgREST accepts either.
  // The URL param is more reliable for new-format (sb_publishable_*) keys where
  // Supabase's gateway may not recognise the Bearer token in the Authorization header.
  const url = `${base}/rest/v1/?apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: supabaseRestHeaders(apiKey),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (res.ok) return { ok: true };

    // 403 with "schema is forbidden" means the key IS valid — the project just
    // restricts schema introspection to service-role keys. We treat this as a
    // successful connection; discover-schema handles the fallback.
    if (res.status === 403) {
      const text = await res.text().catch(() => "");
      if (text.includes("schema") || text.includes("forbidden")) {
        return { ok: true };
      }
    }

    return { ok: false, status: res.status, reason: "http" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
