"use client";

import { groupByMonth, sumColumn } from "@/lib/integrations/fetch-table-data";
import { formatPhpCompact } from "@/lib/format/php";
import { Database, Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExploreTable } from "@/app/api/businesses/[id]/explore/route";

type DataExplorerProps = {
  tables: ExploreTable[];
  loading: boolean;
  discoveredCount?: number;
};

const PREVIEW_ROWS = 8;
const LABEL_MAP: Record<string, string> = {
  created_at: "Created",
  updated_at: "Updated",
  user_id: "User",
  id: "ID",
};

function fmtCell(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") {
    // Shorten ISO dates
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return val.slice(0, 16).replace("T", " ");
    if (val.length > 38) return `${val.slice(0, 36)}…`;
    return val;
  }
  if (typeof val === "number") return val.toLocaleString();
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return JSON.stringify(val);
}

function colLabel(col: string): string {
  return LABEL_MAP[col] ?? col.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function TableSection({ table }: { table: ExploreTable }) {
  const previewRows = table.rows.slice(0, PREVIEW_ROWS);
  const cols = table.columns.slice(0, 8); // cap visible columns

  // Trend chart: group by month from dateColumn
  const trend =
    table.dateColumn && table.rows.length > 0
      ? groupByMonth(table.rows, table.dateColumn)
      : [];

  // Revenue-style sum for the first numeric column found
  const primaryNumericCol = table.numericColumns[0] ?? null;
  const numericSum =
    primaryNumericCol && table.rows.length > 0
      ? sumColumn(table.rows, primaryNumericCol)
      : null;

  // Status distribution
  const statusGroups: Record<string, number> = {};
  if (table.statusColumn) {
    for (const row of table.rows) {
      const s = String(row[table.statusColumn] ?? "unknown");
      statusGroups[s] = (statusGroups[s] ?? 0) + 1;
    }
  }
  const statusData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="flex flex-wrap gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-white/40">Total records</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
            {table.totalCount.toLocaleString()}
          </p>
        </div>
        {numericSum !== null && numericSum > 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-white/40">
              {colLabel(primaryNumericCol!)} (shown records)
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300/90">
              {formatPhpCompact(numericSum)}
            </p>
          </div>
        )}
        {table.totalCount > table.rows.length && (
          <div className="flex items-end pb-1">
            <p className="text-xs text-white/35">
              Showing {table.rows.length} of {table.totalCount.toLocaleString()} records
            </p>
          </div>
        )}
      </div>

      {/* Trend chart */}
      {trend.length >= 2 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-300/70" strokeWidth={1.75} />
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              Activity by month
            </p>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${table.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(96,165,250,0.4)" />
                    <stop offset="100%" stopColor="rgba(96,165,250,0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v, "Records"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill={`url(#grad-${table.name})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status breakdown */}
      {statusData.length >= 2 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/45">
            By {colLabel(table.statusColumn!)}
          </p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [v, "Records"]}
                />
                <Bar dataKey="value" fill="rgba(167,139,250,0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mini data table */}
      {previewRows.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/45">
            Most recent records
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
            <table className="w-full min-w-[500px] text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] bg-white/[0.03]">
                  {cols.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-left font-medium uppercase tracking-wider text-white/40"
                    >
                      {colLabel(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    {cols.map((col) => (
                      <td key={col} className="px-3 py-2 text-white/70">
                        {fmtCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function DataExplorer({ tables, loading, discoveredCount }: DataExplorerProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/40">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-3 text-sm">Loading data from ServeWise…</p>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center text-white/40">
        <Database className="h-10 w-10 opacity-40" strokeWidth={1.5} />
        <p className="text-sm">
          {discoveredCount === 0
            ? "No accessible tables found. Check that RLS allows reads for the anon key."
            : "Tables were found but returned no accessible data. Check RLS policies."}
        </p>
      </div>
    );
  }

  const active = tables[activeTab];

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-5 flex flex-wrap gap-2 border-b border-white/[0.07] pb-3">
        {tables.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTab(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              i === activeTab
                ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
            }`}
          >
            {t.name.replace(/_/g, " ")}
            <span
              className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                i === activeTab ? "bg-blue-400/20 text-blue-200/80" : "bg-white/10 text-white/40"
              }`}
            >
              {t.totalCount > 9999 ? `${Math.round(t.totalCount / 1000)}k` : t.totalCount}
            </span>
          </button>
        ))}
      </div>

      {/* Active table content */}
      {active && <TableSection table={active} />}
    </div>
  );
}
