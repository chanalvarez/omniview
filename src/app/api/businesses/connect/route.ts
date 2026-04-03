import { pingExternalMetrics } from "@/lib/integrations/ping-external";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Fixed metrics route; ServeWise / integration API must expose this. */
const DEFAULT_METRICS_PATH = "/v1/metrics";

function integrationApiBaseUrl(): string | null {
  const fromEnv =
    process.env.INTEGRATION_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_INTEGRATION_API_BASE_URL?.trim();
  if (!fromEnv) return null;
  return fromEnv.replace(/\/+$/, "");
}

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
    api_key?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const apiKey = body.api_key?.trim();
  const baseUrl = integrationApiBaseUrl();
  const metricsPath = DEFAULT_METRICS_PATH;

  if (!name || !apiKey) {
    return NextResponse.json(
      { error: "name and api_key are required." },
      { status: 400 },
    );
  }

  if (!baseUrl) {
    return NextResponse.json(
      {
        error: "integration_not_configured",
        message:
          "Server is missing INTEGRATION_API_BASE_URL (or NEXT_PUBLIC_INTEGRATION_API_BASE_URL). Add your ServeWise API base URL in Vercel → Environment Variables.",
      },
      { status: 503 },
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
        "Could not reach the configured API URL (timeout, DNS, or blocked). Check INTEGRATION_API_BASE_URL is correct (HTTPS).";
    } else if (ping.status === 404) {
      message = `No route at "${metricsPath}" (HTTP 404). Your API must expose GET ${metricsPath} or update the server default.`;
    } else if (ping.status === 401 || ping.status === 403) {
      message =
        "API returned unauthorized (HTTP " +
        ping.status +
        "). Check the integration API key matches what your backend expects for Authorization: Bearer.";
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
