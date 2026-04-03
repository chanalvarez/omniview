import { pingExternalMetrics } from "@/lib/integrations/ping-external";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULT_METRICS_PATH = "/v1/metrics";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  let body: {
    name?: string;
    base_url?: string;
    api_key?: string;
    metrics_path?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const baseUrl = body.base_url?.trim();
  const apiKey = body.api_key?.trim();
  const rawPath = body.metrics_path?.trim() || DEFAULT_METRICS_PATH;
  const metricsPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  if (!name || !baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "name, base_url, and api_key are required." },
      { status: 400 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ping = await pingExternalMetrics(baseUrl, apiKey, metricsPath);
  if (!ping.ok) {
    let message: string;
    if (ping.reason === "network") {
      message =
        "Could not reach that URL (timeout, DNS, or blocked). Check the base URL is your API origin (HTTPS).";
    } else if (ping.status === 404) {
      message = `No route at "${metricsPath}" (HTTP 404). Use your real metrics path — default is /v1/metrics — or deploy an API that exposes it. A marketing site URL usually will not work.`;
    } else if (ping.status === 401 || ping.status === 403) {
      message =
        "API returned unauthorized (HTTP " +
        ping.status +
        "). Check the API key matches what your backend expects for Authorization: Bearer.";
    } else if (ping.status) {
      message = `Metrics endpoint returned HTTP ${ping.status}. Fix the path, key, or server until GET returns 2xx.`;
    } else {
      message = "Could not verify the API endpoint.";
    }
    return NextResponse.json(
      { error: "verification_failed", message },
      { status: 400 },
    );
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const now = new Date().toISOString();

  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      name,
      tagline: "",
    })
    .select("id, name, tagline, created_at")
    .single();

  if (bizError || !business) {
    return NextResponse.json(
      { error: bizError?.message ?? "Could not create business." },
      { status: 500 },
    );
  }

  const { error: connError } = await supabase.from("external_connections").insert({
    business_id: business.id,
    provider: "servewise",
    base_url: normalizedBase,
    api_key: apiKey,
    metrics_path: metricsPath,
    verified_at: now,
    updated_at: now,
  });

  if (connError) {
    await supabase.from("businesses").delete().eq("id", business.id);
    return NextResponse.json(
      { error: connError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    business: {
      id: business.id,
      name: business.name,
      tagline: business.tagline ?? "",
      created_at: business.created_at,
      integration_connected: true,
    },
  });
}
