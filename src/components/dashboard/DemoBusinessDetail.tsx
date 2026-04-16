"use client";

import { GlassCard } from "@/components/GlassCard";
import type { CustomEntity } from "@/context/portfolio-entities-context";
import { getDemoBizStats } from "@/lib/demo-data";
import { Activity, ArrowLeft, BarChart3, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
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

export function DemoBusinessDetail({ business }: { business: CustomEntity }) {
  const stats = getDemoBizStats(business.name);

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      {/* Back */}
      <Link
        href="/entities"
        className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Businesses
      </Link>

      {/* Header */}
      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">Your business</p>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95">
            <Sparkles className="h-3 w-3" aria-hidden />
            Cloud
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300/90">
            Simulated data
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {business.name}
        </h1>
        <p className="mt-2 text-base text-white/55">
          {stats.tagline} · {stats.industry}
        </p>
      </header>

      {/* KPI cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.kpis.map((kpi, i) => (
          <GlassCard key={kpi.label} className="p-5" delay={0.06 + i * 0.03}>
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
              {kpi.value}
            </p>
            <p
              className={`mt-1.5 flex items-center gap-1 text-sm ${
                kpi.up === true
                  ? "text-emerald-400/90"
                  : kpi.up === false
                    ? "text-rose-400/80"
                    : "text-white/45"
              }`}
            >
              {kpi.up === true ? (
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
              ) : kpi.up === false ? (
                <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />
              ) : null}
              {kpi.sub}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Revenue trend chart */}
      <div className="mt-6">
        <GlassCard className="p-5" delay={0.1}>
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Activity className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                Performance
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Monthly Revenue Trend
              </h2>
              <p className="text-xs text-white/35">
                {stats.primaryMetricLabel} · trailing 9 months (₱ millions)
              </p>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.revenueChart}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="demoRevArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                    <stop offset="100%" stopColor="rgba(96,165,250,0)" />
                  </linearGradient>
                  <linearGradient id="demoRevSt" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 8"
                  stroke="rgba(248,250,252,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₱${v}M`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  formatter={(v: number) => [`₱${v}M`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="url(#demoRevSt)"
                  strokeWidth={2.5}
                  fill="url(#demoRevArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Activity bar chart + summary row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-5" delay={0.13}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                <BarChart3 className="h-5 w-5 text-violet-300/85" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                  Volume
                </p>
                <h2 className="mt-1 text-base font-semibold text-white">Activity Index</h2>
                <p className="text-xs text-white/35">Transactions / records per month</p>
              </div>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.activityChart}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 8"
                    stroke="rgba(248,250,252,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="m"
                    tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.94)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    formatter={(v: number) => [v.toLocaleString(), "Records"]}
                  />
                  <Bar dataKey="v" fill="rgba(139,92,246,0.55)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Summary stats */}
        <div className="flex flex-col gap-4">
          <GlassCard className="flex-1 p-5" delay={0.14}>
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              Total Records
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
              {stats.totalRecords.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-white/45">
              Across {stats.dataSources} data sources
            </p>
          </GlassCard>
          <GlassCard className="flex-1 p-5" delay={0.15}>
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              Momentum
            </p>
            <p className="mt-2 flex items-center gap-2 text-3xl font-semibold tabular-nums text-white">
              <TrendingUp className="h-7 w-7 text-emerald-400/90" strokeWidth={2} />
              +{stats.momentum}%
            </p>
            <p className="mt-1 text-sm text-white/45">Year-over-year growth</p>
          </GlassCard>
        </div>
      </div>

      {/* Simulated data notice */}
      <p className="mt-8 text-center text-xs text-white/25">
        All figures are simulated for portfolio demonstration purposes.
      </p>
    </div>
  );
}
