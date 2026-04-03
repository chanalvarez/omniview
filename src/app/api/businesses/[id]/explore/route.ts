import { discoverSchema } from "@/lib/integrations/discover-schema";
import { fetchTableData } from "@/lib/integrations/fetch-table-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Maximum tables fetched per explore call. Keeps response time bounded. */
const MAX_TABLES = 10;

export type ExploreTable = {
  name: string;
  totalCount: number;
  rows: Record<string, unknown>[];
  columns: string[];
  dateColumn: string | null;
  numericColumns: string[];
  statusColumn: string | null;
};

export type ExploreResponse =
  | {
      ok: true;
      tables: ExploreTable[];
      discoveredCount: number;
    }
  | {
      ok: false;
      error: string;
      status?: number;
    };

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse<ExploreResponse>> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const { id: businessId } = await context.params;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: conn, error: connError } = await supabase
    .from("external_connections")
    .select("base_url, api_key")
    .eq("business_id", businessId)
    .maybeSingle();

  if (connError) {
    return NextResponse.json({ ok: false, error: connError.message }, { status: 500 });
  }
  if (!conn) {
    return NextResponse.json(
      { ok: false, error: "No integration connected for this business." },
      { status: 404 },
    );
  }

  const { base_url: baseUrl, api_key: apiKey } = conn as {
    base_url: string;
    api_key: string;
  };

  // 1. Discover what's accessible
  const discovery = await discoverSchema(baseUrl, apiKey);
  if (!discovery.ok) {
    return NextResponse.json(
      { ok: false, error: discovery.error, status: discovery.status },
      { status: 502 },
    );
  }

  const { tables: discovered } = discovery;
  const discoveredCount = discovered.length;

  if (discoveredCount === 0) {
    return NextResponse.json({ ok: true, tables: [], discoveredCount: 0 });
  }

  // 2. Fetch data from up to MAX_TABLES tables in parallel
  const subset = discovered.slice(0, MAX_TABLES);
  const results = await Promise.allSettled(
    subset.map((t) => fetchTableData(baseUrl, apiKey, t.name, t.columns, 50)),
  );

  const tables: ExploreTable[] = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value !== null) {
      tables.push(result.value);
    }
  }

  // Sort: tables with more data first
  tables.sort((a, b) => b.totalCount - a.totalCount);

  return NextResponse.json({ ok: true, tables, discoveredCount });
}
