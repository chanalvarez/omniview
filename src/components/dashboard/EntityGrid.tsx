"use client";

import { AddEntityModal } from "@/components/AddEntityModal";
import { GlassCard } from "@/components/GlassCard";
import { formatPhpThousandsK } from "@/lib/format/php";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const serveSpark = [
  { v: 12 },
  { v: 14 },
  { v: 13 },
  { v: 18 },
  { v: 20 },
  { v: 24 },
  { v: 28 },
];

const scanlyRevenue = [
  { m: "J", k: 42 },
  { m: "F", k: 48 },
  { m: "M", k: 51 },
  { m: "A", k: 46 },
  { m: "M", k: 58 },
  { m: "J", k: 62 },
];

export function EntityGrid() {
  const { addEntity, customEntities } = usePortfolioEntities();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/entities/servewise"
          className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
        >
          <GlassCard
            delay={0.22}
            className="h-full p-5 transition group-hover:border-white/[0.14] group-hover:bg-[rgba(15,23,42,0.72)]"
          >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                ServeWise
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Field & appointments
              </h3>
            </div>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95">
              Active
            </span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-white/45">Today&apos;s appointments</p>
              <p className="mt-1 flex items-center gap-2 text-3xl font-semibold tabular-nums text-white">
                <CalendarClock className="h-6 w-6 text-blue-300/80" strokeWidth={1.5} />
                24
              </p>
              <p className="mt-1 text-sm text-white/50">8 completed · 16 scheduled</p>
            </div>
            <div className="h-[72px] w-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={serveSpark}
                  margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                >
                  <XAxis dataKey="i" hide />
                  <Tooltip
                    cursor={{ stroke: "rgba(148,163,184,0.25)" }}
                    contentStyle={{
                      background: "rgba(15,23,42,0.92)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "rgba(248,250,252,0.65)" }}
                    formatter={(value: number) => [String(value), "7-day load"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="url(#serveLine)"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={900}
                  />
                  <defs>
                    <linearGradient id="serveLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
              Trending up
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 transition group-hover:text-white/60">
              Analytics
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </span>
          </p>
        </GlassCard>
        </Link>

        <Link
          href="/entities/scanly"
          className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
        >
          <GlassCard
            delay={0.28}
            className="h-full p-5 transition group-hover:border-white/[0.14] group-hover:bg-[rgba(15,23,42,0.72)]"
          >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                Scanly
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                Inventory intelligence
              </h3>
            </div>
            <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-200/95">
              Synced
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-white/45">Inventory items</p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-semibold tabular-nums text-white">
                <Package className="h-5 w-5 text-violet-300/85" strokeWidth={1.5} />
                18,420
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-xs text-white/45">Out of stock</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-amber-300/95">
                37
              </p>
              <p className="text-[11px] text-white/40">SKUs need reorder</p>
            </div>
          </div>
          <div className="mt-4 h-[100px] w-full">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
              Revenue (6 mo, ₱K)
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={scanlyRevenue}
                margin={{ top: 2, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scanlyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(96,165,250,0.55)" />
                    <stop offset="55%" stopColor="rgba(167,139,250,0.2)" />
                    <stop offset="100%" stopColor="rgba(167,139,250,0)" />
                  </linearGradient>
                  <linearGradient id="scanlyStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="m"
                  tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [formatPhpThousandsK(value), "Rev"]}
                />
                <Area
                  type="monotone"
                  dataKey="k"
                  stroke="url(#scanlyStroke)"
                  strokeWidth={2}
                  fill="url(#scanlyFill)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 flex justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 transition group-hover:text-white/60">
              Analytics
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </span>
          </p>
        </GlassCard>
        </Link>

        {customEntities.map((entity, i) => (
          <Link
            key={entity.id}
            href={`/entities/${entity.id}`}
            className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
          >
            <GlassCard
              delay={0.32 + i * 0.05}
              className="flex h-full flex-col p-5 transition hover:border-white/[0.14] hover:bg-[rgba(15,23,42,0.72)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                    <Building2 className="h-5 w-5 text-violet-300/85" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                      Portfolio entity
                    </p>
                    <h3 className="mt-0.5 text-lg font-semibold text-white">
                      {entity.name}
                    </h3>
                    {entity.tagline ? (
                      <p className="mt-1 text-sm text-white/50">{entity.tagline}</p>
                    ) : (
                      <p className="mt-1 text-sm italic text-white/40">
                        Connect data sources in Settings to populate KPIs.
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-violet-400/25 bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-200/95">
                  New
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/45">
                <span>Connection steps &amp; metrics</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/35 transition group-hover:text-white/55" aria-hidden />
              </div>
            </GlassCard>
          </Link>
        ))}

        <GlassCard
          delay={0.34}
          className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center md:min-h-0"
        >
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="group flex flex-col items-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.04] transition group-hover:border-white/30 group-hover:bg-white/[0.07]">
              <Plus className="h-7 w-7 text-white/45 transition group-hover:text-white/65" strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Add a business</h3>
            <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-white/45">
              Connect another entity to your portfolio. Stats and alerts will appear
              here.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.1]"
          >
            New entity
          </button>
        </GlassCard>
      </div>

      <AddEntityModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={addEntity}
      />
    </>
  );
}
