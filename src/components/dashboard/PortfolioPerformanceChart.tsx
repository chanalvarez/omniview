"use client";

import { GlassCard } from "@/components/GlassCard";
import {
  formatPhp,
  formatPhpAxisMillions,
  formatPhpCompact,
} from "@/lib/format/php";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", total: 102 },
  { month: "Feb", total: 109 },
  { month: "Mar", total: 116 },
  { month: "Apr", total: 119 },
  { month: "May", total: 129 },
  { month: "Jun", total: 135 },
  { month: "Jul", total: 144 },
  { month: "Aug", total: 152 },
  { month: "Sep", total: 159 },
];

const CURRENT_RUN_RATE_MILLIONS = data[data.length - 1].total;

export function PortfolioPerformanceChart({ compact = false }: { compact?: boolean }) {
  const { customEntities, hydrated } = usePortfolioEntities();
  const hasBusinesses = hydrated && customEntities.length > 0;
  const pad = compact ? "p-4 md:p-5" : "p-5 md:p-6";
  const chartH = compact ? "h-[200px] md:h-[clamp(170px,22vh,240px)]" : "h-[280px]";

  return (
    <GlassCard delay={0.4} className={pad}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Analytics
          </p>
          <h2
            className={`font-semibold text-white ${compact ? "mt-0.5 text-lg" : "mt-1 text-xl"}`}
          >
            Portfolio performance
          </h2>
          <p className={`text-white/50 ${compact ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}>
            {hasBusinesses
              ? "Consolidated revenue (PHP millions) · trailing 9 months"
              : "Add at least one business to see portfolio trends."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/40 md:text-xs">Current run rate</p>
          <p
            className={`font-semibold tabular-nums text-white ${compact ? "text-base" : "text-lg"}`}
          >
            {hasBusinesses
              ? formatPhpCompact(CURRENT_RUN_RATE_MILLIONS * 1_000_000)
              : "—"}
          </p>
        </div>
      </div>
      {hasBusinesses ? (
        <div className={`mt-4 w-full md:mt-5 ${compact ? chartH : "h-[280px]"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(96,165,250,0.55)" />
                  <stop offset="45%" stopColor="rgba(139,92,246,0.28)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                </linearGradient>
                <linearGradient id="portfolioStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 8"
                stroke="rgba(248,250,252,0.06)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(248,250,252,0.08)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatPhpAxisMillions(Number(v))}
                domain={["dataMin - 4", "dataMax + 4"]}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.94)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                }}
                labelStyle={{ color: "rgba(248,250,252,0.6)", fontSize: 12 }}
                formatter={(value: number) => [
                  formatPhp(value * 1_000_000),
                  "Revenue",
                ]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="url(#portfolioStroke)"
                strokeWidth={2.5}
                fill="url(#portfolioArea)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          className={`mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-white/45 md:mt-5 ${compact ? "min-h-[100px] py-6 text-xs md:min-h-[120px] md:text-sm" : "h-[200px] text-sm"}`}
        >
          Chart unlocks when your first business is connected.
        </div>
      )}
    </GlassCard>
  );
}
