import { normalizeExternalMetrics } from "@/lib/integrations/normalize-metrics";
import { supabaseRestHeaders } from "@/lib/integrations/supabase-rest-headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { connected: false, source: "none" as const, error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const { id: businessId } = await context.params;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { connected: false, source: "none" as const, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data: integration, error: intError } = await supabase
    .from("external_connections")
    .select("base_url, api_key, metrics_path")
    .eq("business_id", businessId)
    .maybeSingle();

  if (intError) {
    return NextResponse.json(
      { connected: false, source: "none" as const, error: intError.message },
      { status: 500 },
    );
  }

  if (!integration) {
    return NextResponse.json({
      connected: false,
      source: "none" as const,
    });
  }

  const base = integration.base_url.replace(/\/+$/, "");
  const path = integration.metrics_path.startsWith("/")
    ? integration.metrics_path
    : `/${integration.metrics_path}`;
  const fullUrl = `${base}${path}`;

  const seed = hashId(businessId);

  try {
    const res = await fetch(fullUrl, {
      method: "GET",
      headers: supabaseRestHeaders(integration.api_key),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({
        connected: true,
        source: "error" as const,
        error: `ServeWise returned ${res.status}. ${text.slice(0, 200)}`,
        metrics: normalizeExternalMetrics({}, seed),
      });
    }

    const raw = (await res.json()) as unknown;
    const metrics = normalizeExternalMetrics(raw, seed);

    return NextResponse.json({
      connected: true,
      source: "live" as const,
      metrics,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({
      connected: true,
      source: "error" as const,
      error: message,
      metrics: normalizeExternalMetrics({}, seed),
    });
  }
}
