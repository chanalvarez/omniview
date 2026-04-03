import { supabaseRestHeaders } from "@/lib/integrations/supabase-rest-headers";

export type TableColumn = {
  name: string;
  pgType: string;
  isDatetime: boolean;
  isNumeric: boolean;
};

export type DiscoveredTable = {
  name: string;
  columns: TableColumn[];
};

export type SchemaDiscoveryResult =
  | { ok: true; tables: DiscoveredTable[] }
  | { ok: false; status?: number; reason: "http" | "network"; error: string };

/**
 * Fetches the PostgREST OpenAPI spec from /rest/v1/ and returns the list of
 * accessible tables/views along with their column metadata.
 */
export async function discoverSchema(
  baseUrl: string,
  apiKey: string,
): Promise<SchemaDiscoveryResult> {
  const base = baseUrl.replace(/\/+$/, "");
  try {
    const res = await fetch(`${base}/rest/v1/?apikey=${encodeURIComponent(apiKey)}`, {
      method: "GET",
      headers: supabaseRestHeaders(apiKey),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        reason: "http",
        error: `OpenAPI spec returned HTTP ${res.status}`,
      };
    }

    const spec = (await res.json()) as unknown;
    const tables = parseOpenApiTables(spec);
    return { ok: true, tables };
  } catch (e) {
    return {
      ok: false,
      reason: "network",
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

// ── OpenAPI 2.0 spec shape (PostgREST) ───────────────────────────────────────

type OpenApiSpec = {
  paths?: Record<string, { get?: unknown }>;
  definitions?: Record<string, { properties?: Record<string, OpenApiProperty> }>;
};

type OpenApiProperty = {
  type?: string;
  format?: string;
  description?: string;
};

const DATETIME_FORMATS = new Set(["timestamp with time zone", "timestamp", "date", "time"]);
const NUMERIC_TYPES = new Set(["integer", "number"]);
const NUMERIC_NAME_HINTS = ["amount", "total", "price", "revenue", "cost", "fee", "qty", "quantity", "count", "balance", "rate"];

function isDatetimeColumn(col: string, prop: OpenApiProperty): boolean {
  if (DATETIME_FORMATS.has(prop.format ?? "")) return true;
  return (
    col.endsWith("_at") ||
    col.endsWith("_date") ||
    col === "created_at" ||
    col === "updated_at" ||
    col === "date"
  );
}

function isNumericColumn(col: string, prop: OpenApiProperty): boolean {
  if (NUMERIC_TYPES.has(prop.type ?? "")) return true;
  return NUMERIC_NAME_HINTS.some((h) => col.toLowerCase().includes(h));
}

function parseOpenApiTables(raw: unknown): DiscoveredTable[] {
  if (typeof raw !== "object" || raw === null) return [];
  const spec = raw as OpenApiSpec;
  const { paths = {}, definitions = {} } = spec;

  const tables: DiscoveredTable[] = [];

  for (const [path, methods] of Object.entries(paths)) {
    // PostgREST exposes tables as /table_name; skip RPC paths and root
    if (path === "/" || path.startsWith("/rpc/")) continue;
    if (!methods?.get) continue;

    const tableName = path.replace(/^\//, "");
    const def = definitions[tableName];
    const columns: TableColumn[] = [];

    if (def?.properties) {
      for (const [colName, prop] of Object.entries(def.properties)) {
        columns.push({
          name: colName,
          pgType: prop.format ? `${prop.type ?? ""}::${prop.format}` : (prop.type ?? "text"),
          isDatetime: isDatetimeColumn(colName, prop),
          isNumeric: isNumericColumn(colName, prop),
        });
      }
    }

    tables.push({ name: tableName, columns });
  }

  return tables;
}
