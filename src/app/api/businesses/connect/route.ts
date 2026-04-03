import { discoverSchema } from "@/lib/integrations/discover-schema";
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

  // Verify by trying schema discovery — this handles schema-forbidden projects
  // by falling back to probing common table names directly.
  // If at least one table responds (or schema loads), the key is valid.
  const discovery = await discoverSchema(baseUrl, apiKey);
  if (!discovery.ok) {
    return NextResponse.json(
      {
        error: "verification_failed",
        message:
          "Could not reach that URL. Check the Supabase project URL (e.g. https://xxxx.supabase.co) and your internet connection.",
      },
      { status: 400 },
    );
  }
  if (discovery.tables.length === 0) {
    return NextResponse.json(
      {
        error: "verification_failed",
        message:
          "URL reached but no accessible tables found. Make sure you ran the anon RLS policy SQL on your tables in Supabase.",
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  // ── Find or create the business row ──────────────────────────────────────
  type BizRow = { id: string; name: string; created_at: string };

  let biz: BizRow | null = null;
  let isNew = false;

  // Check if this user already has a business with this name
  const { data: existing } = await supabase
    .from("businesses")
    .select("id, name, created_at")
    .eq("user_id", user.id)
    .eq("name", name)
    .maybeSingle();

  if (existing) {
    biz = existing as BizRow;
  } else {
    // Create new — try with tagline, fall back without it
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
      return NextResponse.json(
        { error: insertResult.error.message ?? "Could not create business." },
        { status: 500 },
      );
    }

    biz = insertResult.data as BizRow;
    isNew = true;
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
