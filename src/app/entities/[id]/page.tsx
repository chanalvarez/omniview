"use client";

import { GlassCard } from "@/components/GlassCard";
import { formatPhpCompact, formatPhpThousandsK } from "@/lib/format/php";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { Activity, ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildTrend(seed: number) {
  const base = 40 + (seed % 35);
  return Array.from({ length: 9 }, (_, i) => ({
    m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"][i],
    v: Math.round(base + i * 3 + (seed >> (i % 4)) % 8),
  }));
}

export default function BusinessDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { customEntities, hydrated } = usePortfolioEntities();
  const business = customEntities.find((e) => e.id === id);

  const seed = business ? hashId(business.id) : 0;
  const trend = buildTrend(seed);
  const pulse = 78 + (seed % 18);
  const revK = 420 + (seed % 180);

  if (!hydrated) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
        <p className="text-sm text-white/50">Loading…</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
        <Link
          href="/entities"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Businesses
        </Link>
        <GlassCard className="mt-8 p-8" delay={0}>
          <p className="text-white/70">
            This business was not found. It may have been removed from this device.
          </p>
          <Link
            href="/entities"
            className="mt-4 inline-block text-sm font-medium text-blue-300/90 transition hover:text-white"
          >
            Go to Businesses
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <Link
        href="/entities"
        className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Businesses
      </Link>

      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Your business
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95">
            <Sparkles className="h-3 w-3" aria-hidden />
            Connected
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {business.name}
        </h1>
        {business.tagline ? (
          <p className="mt-2 text-lg text-white/55">{business.tagline}</p>
        ) : (
          <p className="mt-2 text-base text-white/45">
            Monitoring active in your OmniView workspace.
          </p>
        )}
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5" delay={0.04}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Health pulse
          </p>
          <p className="mt-2 flex items-baseline gap-1 text-3xl font-semibold tabular-nums text-white">
            {pulse}
            <span className="text-lg text-white/40">/100</span>
          </p>
          <p className="mt-1 text-sm text-emerald-300/85">On track this month</p>
        </GlassCard>
        <GlassCard className="p-5" delay={0.06}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Est. revenue (30d)
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {formatPhpCompact(revK * 1000)}
          </p>
          <p className="mt-1 text-sm text-white/45">PHP, illustrative</p>
        </GlassCard>
        <GlassCard className="p-5" delay={0.08}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Attention items
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-200/95">
            {2 + (seed % 4)}
          </p>
          <p className="mt-1 text-sm text-white/45">Review when convenient</p>
        </GlassCard>
        <GlassCard className="p-5" delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Momentum
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums text-white">
            <TrendingUp className="h-6 w-6 text-emerald-400/90" strokeWidth={2} />
            +{6 + (seed % 9)}%
          </p>
          <p className="mt-1 text-sm text-white/45">Vs. prior period</p>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2" delay={0.12}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Activity className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                Performance
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Activity index (₱K units)
              </h2>
              <p className="mt-1 text-sm text-white/45">
                A snapshot of how this business is trending in OmniView.
              </p>
              <div className="mt-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bizArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                        <stop offset="100%" stopColor="rgba(96,165,250,0)" />
                      </linearGradient>
                      <linearGradient id="bizSt" x1="0" y1="0" x2="1" y2="0">
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
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.94)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [formatPhpThousandsK(value), "Index"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="url(#bizSt)"
                      strokeWidth={2.5}
                      fill="url(#bizArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" delay={0.14}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Summary
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">At a glance</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li className="flex justify-between gap-2 border-b border-white/[0.06] pb-3">
              <span>Cash outlook</span>
              <span className="font-medium text-white/85">Stable</span>
            </li>
            <li className="flex justify-between gap-2 border-b border-white/[0.06] pb-3">
              <span>Team load</span>
              <span className="font-medium text-white/85">Balanced</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Risk flags</span>
              <span className="font-medium text-emerald-300/90">None critical</span>
            </li>
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-white/35">
            Figures are representative for the demo. OmniView keeps everything in your
            browser until you plug in live data sources later.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
