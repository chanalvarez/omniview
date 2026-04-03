import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as {
    business_id?: string;
    base_url?: string;
    api_key?: string;
    metrics_path?: string;
    provider?: string;
  };

  const businessId = body.business_id?.trim();
  const baseUrl = body.base_url?.trim();
  const apiKey = body.api_key?.trim();
  const rawPath = body.metrics_path?.trim() || "/v1/metrics";
  const metricsPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const provider = body.provider?.trim() || "servewise";

  if (!businessId || !baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "business_id, base_url, and api_key are required." },
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

  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (bizError || !business) {
    return NextResponse.json(
      { error: "Business not found or access denied." },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  const { error: upsertError } = await supabase.from("external_connections").upsert(
    {
      business_id: businessId,
      provider,
      base_url: baseUrl.replace(/\/+$/, ""),
      api_key: apiKey,
      metrics_path: metricsPath,
      verified_at: now,
      updated_at: now,
    },
    { onConflict: "business_id" },
  );

  if (upsertError) {
    return NextResponse.json(
      { error: upsertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
