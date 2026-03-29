"use client";

import { GlassCard } from "@/components/GlassCard";
import { EntityDetailBack } from "@/components/entity-detail/EntityDetailBack";
import { formatPhpCompact } from "@/lib/format/php";
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

const volume30 = [
  { d: "1", jobs: 18 },
  { d: "5", jobs: 22 },
  { d: "10", jobs: 20 },
  { d: "15", jobs: 26 },
  { d: "20", jobs: 24 },
  { d: "25", jobs: 28 },
  { d: "30", jobs: 31 },
];

const weekCompare = [
  { w: "W1", done: 142 },
  { w: "W2", done: 156 },
  { w: "W3", done: 148 },
  { w: "W4", done: 164 },
];

const todayRows = [
  { time: "08:00", client: "Metro Plumbing", tech: "A. Reyes", status: "Done" },
  { time: "10:30", client: "North Retail Hub", tech: "J. Cruz", status: "En route" },
  { time: "13:00", client: "Bayview HOA", tech: "M. Santos", status: "Scheduled" },
  { time: "15:30", client: "Lumen Clinic", tech: "A. Reyes", status: "Scheduled" },
  { time: "17:00", client: "Harbor Cafe", tech: "J. Cruz", status: "Scheduled" },
];

export default function ServeWiseDetailPage() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <EntityDetailBack />

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            OmniView product
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              ServeWise
            </h1>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95">
              Active
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-base text-white/55">
            Field operations and appointments, drill-down for utilization, completion,
            and schedule health.
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today’s appointments", value: "24", sub: "8 done · 16 upcoming" },
          { label: "Rolling 7-day jobs", value: "156", sub: "+9% vs prior week" },
          { label: "First-time fix rate", value: "92%", sub: "Target 90%" },
          { label: "Est. labor revenue (MTD)", value: formatPhpCompact(1_864_000), sub: "PHP, after discounts" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5" delay={0.04}>
            <p className="text-xs font-medium uppercase tracking-wider text-white/45">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{s.value}</p>
            <p className="mt-1 text-sm text-white/45">{s.sub}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2" delay={0.08}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Operations
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Job volume (30-day trend)
          </h2>
          <p className="mt-1 text-sm text-white/45">Scheduled + completed field visits</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volume30} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="swVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                    <stop offset="100%" stopColor="rgba(96,165,250,0)" />
                  </linearGradient>
                  <linearGradient id="swSt" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(248,250,252,0.06)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  formatter={(v: number) => [`${v} jobs`, "Volume"]}
                />
                <Area type="monotone" dataKey="jobs" stroke="url(#swSt)" strokeWidth={2.5} fill="url(#swVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5" delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Throughput
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Completed jobs by week</h2>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekCompare} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(248,250,252,0.06)" vertical={false} />
                <XAxis dataKey="w" tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <defs>
                  <linearGradient id="swBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <Bar dataKey="done" fill="url(#swBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-0 overflow-hidden" delay={0.12}>
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-base font-semibold text-white">Today’s schedule</h2>
          <p className="mt-1 text-sm text-white/45">Sample dispatch board — wire to your jobs API.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Technician</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {todayRows.map((row) => (
                <tr key={row.time + row.client} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-5 py-3 tabular-nums text-white/60">{row.time}</td>
                  <td className="px-5 py-3 font-medium text-white">{row.client}</td>
                  <td className="px-5 py-3 text-white/55">{row.tech}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        row.status === "Done"
                          ? "rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-200/95"
                          : row.status === "En route"
                            ? "rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200/95"
                            : "rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/70"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
