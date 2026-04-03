"use client";

import type { SummaryResponse } from "@/app/api/businesses/[id]/summary/route";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function BusinessConnectionAlert({
  businessId,
  integrationConnected,
}: {
  businessId: string;
  integrationConnected?: boolean;
}) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  useEffect(() => {
    if (!integrationConnected) return;
    let cancelled = false;
    void fetch(`/api/businesses/${businessId}/summary`, { credentials: "include" })
      .then((r) => r.json() as Promise<SummaryResponse>)
      .then((j) => { if (!cancelled) setSummary(j); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [businessId, integrationConnected]);

  if (!integrationConnected) return null;
  if (!summary?.ok) return null;

  const { totalCount, thisMonthCount, growthPct, perDayAvg, primaryTable } = summary;
  const growing = growthPct !== null && growthPct >= 0;

  return (
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
  );
}
