"use client";

import type { SummaryResponse } from "@/app/api/businesses/[id]/summary/route";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const REFRESH_INTERVAL_MS = 30_000;

export function BusinessConnectionAlert({
  businessId,
  integrationConnected,
}: {
  businessId: string;
  integrationConnected?: boolean;
}) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSummary = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/summary`, { credentials: "include" });
      const j = (await res.json()) as SummaryResponse;
      setSummary(j);
      setLastUpdated(new Date());
    } catch {
      /* keep previous data */
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!integrationConnected) return;
    void fetchSummary(false);

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => void fetchSummary(true), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [businessId, integrationConnected, fetchSummary]);

  if (!integrationConnected) return null;
  if (!summary?.ok) return null;

  const { totalCount, thisMonthCount, growthPct, perDayAvg, primaryTable } = summary;
  const growing = growthPct !== null && growthPct >= 0;

  const updatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {/* Total served */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-2 text-center">
        <p className="text-[10px] uppercase tracking-wider text-white/40">Total served</p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-white">
          {totalCount >= 1000
            ? `${(totalCount / 1000).toFixed(1)}k`
            : totalCount.toLocaleString()}
        </p>
        {primaryTable && (
          <p className="truncate text-[9px] text-white/30">{primaryTable.replace(/_/g, " ")}</p>
        )}
      </div>

      {/* This month */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-2 text-center">
        <p className="text-[10px] uppercase tracking-wider text-white/40">This month</p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-white">
          {thisMonthCount.toLocaleString()}
        </p>
        <p className="text-[9px] text-white/30">served</p>
      </div>

      {/* Growth & per-day */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-2 text-center">
        <p className="text-[10px] uppercase tracking-wider text-white/40">Per day</p>
        <p className="mt-0.5 text-base font-semibold tabular-nums text-white">{perDayAvg}</p>
        {growthPct !== null ? (
          <p
            className={`flex items-center justify-center gap-0.5 text-[10px] font-medium ${
              growing ? "text-emerald-400/90" : "text-rose-400/90"
            }`}
          >
            {growing ? (
              <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.5} />
            )}
            {growthPct > 0 ? "+" : ""}
            {growthPct}% vs last mo
          </p>
        ) : (
          <p className="text-[9px] text-white/30">avg / day</p>
        )}
      </div>
    </div>
    {/* Last updated + manual refresh */}
    <div className="mt-1.5 flex items-center justify-between gap-2">
      {updatedLabel && (
        <p className="text-[10px] text-white/25">Updated {updatedLabel}</p>
      )}
      <button
        onClick={() => void fetchSummary(false)}
        disabled={refreshing}
        className="ml-auto flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-white/30 transition hover:bg-white/[0.05] hover:text-white/55 disabled:opacity-40"
        title="Refresh stats"
      >
        <RefreshCw className={`h-2.5 w-2.5 ${refreshing ? "animate-spin" : ""}`} strokeWidth={2.5} />
        Refresh
      </button>
    </div>
    </>
  );
}
