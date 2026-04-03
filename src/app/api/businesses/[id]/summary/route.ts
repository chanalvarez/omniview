import { discoverSchema } from "@/lib/integrations/discover-schema";
import { supabaseRestHeaders } from "@/lib/integrations/supabase-rest-headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type SummaryResponse =
  | {
      ok: true;
      totalCount: number;
      thisMonthCount: number;
      lastMonthCount: number;
      growthPct: number | null;
      perDayAvg: number;
      primaryTable: string | null;
      allTables?: { name: string; count: number }[];
    }
  | { ok: false; error: string };

/**
 * Count-only PostgREST fetch — returns 0 on any error.
 * Uses limit=1 (not 0) so PostgREST returns "0-0/N" in Content-Range
 * rather than the "*\/*" format that limit=0 can produce.
 */
async function countTable(
  baseUrl: string,
  apiKey: string,
  table: string,
  filter?: string,
): Promise<number> {
  const qs = filter ? `?${filter}&limit=1` : "?limit=1";
  try {
    const res = await fetch(`${baseUrl}/rest/v1/${table}${qs}`, {
      headers: { ...supabaseRestHeaders(apiKey), Prefer: "count=exact" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return 0;
    const range = res.headers.get("content-range") ?? "";
    const m = range.match(/\/(\d+)$/);
    if (m) return parseInt(m[1], 10);
    // Fallback: count from actual rows
    const json = (await res.json().catch(() => [])) as unknown;
    return Array.isArray(json) ? json.length : 0;
  } catch {
    return 0;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<SummaryResponse>> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 503 });
  }

  const { id: businessId } = await context.params;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: conn } = await supabase
    .from("external_connections")
    .select("base_url, api_key")
    .eq("business_id", businessId)
    .maybeSingle();

  if (!conn) {
    return NextResponse.json({ ok: false, error: "No integration" }, { status: 404 });
  }

  const { base_url: rawBase, api_key: apiKey } = conn as { base_url: string; api_key: string };
  const baseUrl = rawBase.replace(/\/+$/, "");

  // Discover tables, pick the one with the most data
  const discovery = await discoverSchema(baseUrl, apiKey);
  if (!discovery.ok || discovery.tables.length === 0) {
    return NextResponse.json({
      ok: true,
      totalCount: 0,
      thisMonthCount: 0,
      lastMonthCount: 0,
      growthPct: null,
      perDayAvg: 0,
      primaryTable: null,
    });
  }

  // Count all tables in parallel, then pick the one with the most accessible rows.
  // This avoids picking an empty/RLS-blocked table just because it has a datetime column.
  const totalCounts = await Promise.all(
    discovery.tables.map((t) => countTable(baseUrl, apiKey, t.name)),
  );

  let bestIdx = 0;
  for (let i = 1; i < totalCounts.length; i++) {
    if (totalCounts[i] > totalCounts[bestIdx]) bestIdx = i;
  }

  const primaryTable = discovery.tables[bestIdx];
  const totalCount = totalCounts[bestIdx];
  const dateCol = primaryTable.columns.find((c) => c.isDatetime)?.name ?? null;

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const thisMonthStart = `${y}-${m}-01`;
  const lastMonthDate = new Date(Date.UTC(y, now.getUTCMonth() - 1, 1));
  const ly = lastMonthDate.getUTCFullYear();
  const lm = String(lastMonthDate.getUTCMonth() + 1).padStart(2, "0");
  const lastMonthStart = `${ly}-${lm}-01`;

  const [thisMonthCount, lastMonthCount] = await Promise.all([
    dateCol
      ? countTable(baseUrl, apiKey, primaryTable.name, `${dateCol}=gte.${thisMonthStart}`)
      : Promise.resolve(0),
    dateCol
      ? countTable(
          baseUrl,
          apiKey,
          primaryTable.name,
          `${dateCol}=gte.${lastMonthStart}&${dateCol}=lt.${thisMonthStart}`,
        )
      : Promise.resolve(0),
  ]);

  const growthPct =
    lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : thisMonthCount > 0
        ? 100
        : null;

  const daysIntoMonth = now.getUTCDate();
  const perDayAvg = daysIntoMonth > 0 ? Math.round((thisMonthCount / daysIntoMonth) * 10) / 10 : 0;

  return NextResponse.json({
    ok: true,
    totalCount,
    thisMonthCount,
    lastMonthCount,
    growthPct,
    perDayAvg,
    primaryTable: primaryTable.name,
    allTables: discovery.tables.map((t, i) => ({ name: t.name, count: totalCounts[i] })),
  });
}
