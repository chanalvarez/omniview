import { pingExternalMetrics } from "@/lib/integrations/ping-external";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Optional env fallback for the Supabase REST base URL. */
function envBaseUrl(): string | null {
  const v =
    process.env.INTEGRATION_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_INTEGRATION_API_BASE_URL?.trim();
  return v ? v.replace(/\/+$/, "") : null;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { name?: string; api_key?: string; base_url?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const apiKey = body.api_key?.trim();
  // Accept base_url from the request body first, fall back to env
  const baseUrl = body.base_url?.trim()
    ? body.base_url.trim().replace(/\/+$/, "")
    : envBaseUrl();

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
          "Provide your ServeWise Supabase URL in the form (e.g. https://<ref>.supabase.co), or set INTEGRATION_API_BASE_URL on the server.",
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

  // Verify the key against the PostgREST OpenAPI endpoint
  const ping = await pingExternalMetrics(baseUrl, apiKey);
  if (!ping.ok) {
    let message: string;
    if (ping.reason === "network") {
      message =
        "Could not reach that URL (timeout, DNS, or HTTPS). Double-check the Supabase project URL.";
    } else if (ping.status === 401 || ping.status === 403) {
      message = `Invalid key (HTTP ${ping.status}). Use the anon public key from Supabase → Project Settings → API.`;
    } else if (ping.status) {
      message = `URL returned HTTP ${ping.status}. Make sure this is a valid Supabase project URL.`;
    } else {
      message = "Could not verify the API endpoint.";
    }
    return NextResponse.json({ error: "verification_failed", message }, { status: 400 });
  }

  const now = new Date().toISOString();

  // ── Find or create the business row ──────────────────────────────────────
  type BizRow = { id: string; name: string; created_at: string };

  let biz: BizRow | null = null;
  let isNew = true;

  // Try with tagline column first; if column missing, retry without it
  let insertResult = await supabase
    .from("businesses")
    .insert({ user_id: user.id, name, tagline: "" })
    .select("id, name, created_at")
    .single();

  if (insertResult.error?.message?.includes("tagline")) {
    insertResult = await supabase
      .from("businesses")
      .insert({ user_id: user.id, name })
      .select("id, name, created_at")
      .single();
  }

  if (insertResult.error) {
    const isDupe =
      insertResult.error.message.includes("unique") ||
      insertResult.error.message.includes("duplicate");

    if (isDupe) {
      // Business name already exists for this user — reuse it
      const existing = await supabase
        .from("businesses")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .eq("name", name)
        .maybeSingle();

      if (existing.data) {
        biz = existing.data as BizRow;
        isNew = false;
      } else {
        return NextResponse.json(
          { error: insertResult.error.message },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { error: insertResult.error.message ?? "Could not create business." },
        { status: 500 },
      );
    }
  } else {
    biz = insertResult.data;
  }

  if (!biz) {
    return NextResponse.json({ error: "Could not create or find the business." }, { status: 500 });
  }

  // ── Upsert external_connection (handles reconnect case too) ───────────────
  const { error: connError } = await supabase.from("external_connections").upsert(
    {
      business_id: biz.id,
      provider: "servewise",
      base_url: baseUrl,
      api_key: apiKey,
      metrics_path: "/rest/v1/",
      verified_at: now,
      updated_at: now,
    },
    { onConflict: "business_id" },
  );

  if (connError) {
    // Only roll back if we just created this business
    if (isNew) await supabase.from("businesses").delete().eq("id", biz.id);
    return NextResponse.json({ error: connError.message }, { status: 500 });
  }

  return NextResponse.json({
    business: {
      id: biz.id,
      name: biz.name,
      tagline: "",
      created_at: biz.created_at,
      integration_connected: true,
    },
  });
}
