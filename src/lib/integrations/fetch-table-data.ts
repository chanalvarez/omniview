import { supabaseRestHeaders } from "@/lib/integrations/supabase-rest-headers";
import type { TableColumn } from "@/lib/integrations/discover-schema";

export type TableData = {
  name: string;
  totalCount: number;
  rows: Record<string, unknown>[];
  columns: string[];
  dateColumn: string | null;
  numericColumns: string[];
  statusColumn: string | null;
};

/** Fetch up to `limit` rows from a PostgREST table, plus exact count. */
export async function fetchTableData(
  baseUrl: string,
  apiKey: string,
  tableName: string,
  columns: TableColumn[],
  limit = 50,
): Promise<TableData | null> {
  const base = baseUrl.replace(/\/+$/, "");

  const dateCol = columns.find((c) => c.isDatetime)?.name ?? null;
  const numericCols = columns.filter((c) => c.isNumeric).map((c) => c.name);
  const statusCol =
    columns.find((c) => ["status", "state", "type", "stage"].includes(c.name))?.name ?? null;

  const order = dateCol ? `&order=${dateCol}.desc` : "";
  const url = `${base}/rest/v1/${tableName}?apikey=${encodeURIComponent(apiKey)}&limit=${limit}${order}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...supabaseRestHeaders(apiKey),
        Prefer: "count=exact",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) return null;

    // PostgREST returns "0-49/1234" or "*/1234" in Content-Range
    const contentRange = res.headers.get("content-range") ?? "";
    const countMatch = contentRange.match(/\/(\d+)$/);
    let totalCount = countMatch ? parseInt(countMatch[1], 10) : 0;

    const json = (await res.json()) as unknown;
    const rows: Record<string, unknown>[] = Array.isArray(json)
      ? (json as Record<string, unknown>[])
      : [];

    if (totalCount === 0) totalCount = rows.length;
    if (rows.length === 0 && totalCount === 0) return null;

    const colNames = rows.length > 0 ? Object.keys(rows[0]) : columns.map((c) => c.name);

    return {
      name: tableName,
      totalCount,
      rows,
      columns: colNames,
      dateColumn: dateCol,
      numericColumns: numericCols.filter((c) => colNames.includes(c)),
      statusColumn: statusCol,
    };
  } catch {
    return null;
  }
}

/**
 * Sums a numeric column across rows (for revenue-style aggregation).
 * Handles string-coerced numbers.
 */
export function sumColumn(rows: Record<string, unknown>[], col: string): number {
  return rows.reduce((acc, row) => {
    const v = row[col];
    const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

/**
 * Groups rows by calendar month from a datetime column.
 * Returns an array of { month: "YYYY-MM", count: number } sorted oldest-first.
 */
export function groupByMonth(
  rows: Record<string, unknown>[],
  dateCol: string,
): { month: string; label: string; count: number }[] {
  const byMonth: Record<string, number> = {};
  for (const row of rows) {
    const val = row[dateCol];
    if (typeof val !== "string") continue;
    const ym = val.slice(0, 7); // "YYYY-MM"
    if (!/^\d{4}-\d{2}$/.test(ym)) continue;
    byMonth[ym] = (byMonth[ym] ?? 0) + 1;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      label: new Date(`${month}-01`).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      count,
    }));
}
