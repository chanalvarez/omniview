/**
 * Server-only connectivity check. Does not log secrets.
 * Expects a JSON-capable GET that returns 2xx with Bearer auth.
 */
export async function pingExternalMetrics(
  baseUrl: string,
  apiKey: string,
  metricsPath: string,
): Promise<
  { ok: true } | { ok: false; status?: number; reason: "http" | "network" }
> {
  const base = baseUrl.replace(/\/+$/, "");
  const path = metricsPath.startsWith("/") ? metricsPath : `/${metricsPath}`;
  const url = `${base}${path}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (res.ok) {
      return { ok: true };
    }
    return { ok: false, status: res.status, reason: "http" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
