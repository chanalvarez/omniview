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
 * Common table names to probe when the OpenAPI schema endpoint is blocked.
 * PostgREST exposes each table as /rest/v1/<tableName>, so we can discover
 * tables by trying to fetch from them directly.
 */
const PROBE_TABLE_NAMES = [
  "inventory", "products", "orders", "order_items", "users", "customers",
  "tickets", "stores", "staff", "malls", "items", "sales", "transactions",
  "payments", "bookings", "appointments", "services", "categories", "brands",
  "suppliers", "receipts", "logs", "events", "sessions", "records", "entries",
  "queue_entries", "queues", "reservations", "subscriptions", "invoices",
];

/**
 * Fetches the PostgREST OpenAPI spec from /rest/v1/ and returns the list of
 * accessible tables/views along with their column metadata.
 *
 * Falls back to probing common table names directly when the schema endpoint
 * is blocked (e.g. projects that restrict schema introspection to service-role).
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

    if (res.ok) {
      const spec = (await res.json()) as unknown;
      const tables = parseOpenApiTables(spec);
      // If schema loaded but listed no tables, still try probing
      if (tables.length > 0) return { ok: true, tables };
    }

    // Schema endpoint blocked or returned no tables — fall back to probing
    // common table names directly. This handles 401, 403, or any other status.
    const tables = await probeTableNames(base, apiKey);
    return { ok: true, tables };
  } catch (e) {
    return {
      ok: false,
      reason: "network",
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

/**
 * When schema introspection is blocked, probe a list of common table names
 * directly and infer column metadata from actual row data.
 */
async function probeTableNames(base: string, apiKey: string): Promise<DiscoveredTable[]> {
  const results = await Promise.allSettled(
    PROBE_TABLE_NAMES.map(async (tableName): Promise<DiscoveredTable | null> => {
      try {
        const url = `${base}/rest/v1/${tableName}?apikey=${encodeURIComponent(apiKey)}&limit=3`;
        const res = await fetch(url, {
          headers: supabaseRestHeaders(apiKey),
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as unknown;
        if (!Array.isArray(json) || json.length === 0) return null;

        const firstRow = json[0] as Record<string, unknown>;
        const columns: TableColumn[] = Object.entries(firstRow).map(([name, value]) => ({
          name,
          pgType: inferPgType(value),
          isDatetime: isDatetimeLike(name, value),
          isNumeric: isNumericLike(name, value),
        }));
        return { name: tableName, columns };
      } catch {
        return null;
      }
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<DiscoveredTable> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);
}

function inferPgType(value: unknown): string {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "timestamp";
  }
  return "text";
}

function isDatetimeLike(name: string, value: unknown): boolean {
  if (name.endsWith("_at") || name.endsWith("_date") || name === "date" || name === "created" || name === "updated") return true;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return true;
  return false;
}

function isNumericLike(name: string, value: unknown): boolean {
  if (typeof value === "number") return true;
  const hints = ["amount", "total", "price", "revenue", "cost", "fee", "qty", "quantity", "count", "balance", "rate"];
  return hints.some((h) => name.toLowerCase().includes(h));
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
