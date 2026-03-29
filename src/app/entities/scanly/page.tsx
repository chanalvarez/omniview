"use client";

import { GlassCard } from "@/components/GlassCard";
import { EntityDetailBack } from "@/components/entity-detail/EntityDetailBack";
import { formatPhp, formatPhpThousandsK } from "@/lib/format/php";
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

const revenue12 = [
  { m: "Jan", k: 820 },
  { m: "Feb", k: 864 },
  { m: "Mar", k: 902 },
  { m: "Apr", k: 888 },
  { m: "May", k: 940 },
  { m: "Jun", k: 978 },
  { m: "Jul", k: 1012 },
  { m: "Aug", k: 1056 },
  { m: "Sep", k: 1104 },
  { m: "Oct", k: 1148 },
  { m: "Nov", k: 1188 },
  { m: "Dec", k: 1224 },
];

const categoryMix = [
  { cat: "Electronics", pct: 34 },
  { cat: "Home", pct: 22 },
  { cat: "Apparel", pct: 18 },
  { cat: "Food", pct: 15 },
  { cat: "Other", pct: 11 },
];

const lowStock = [
  { sku: "SKU-20491", name: "LED driver 24V", loc: "MNL-A", oh: 4, moq: 24 },
  { sku: "SKU-88102", name: "Thermal paste 5g", loc: "CEB-B", oh: 0, moq: 48 },
  { sku: "SKU-44012", name: "RJ45 coupler", loc: "MNL-A", oh: 12, moq: 120 },
];

export default function ScanlyDetailPage() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <EntityDetailBack />

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            OmniView product
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Scanly</h1>
            <span className="rounded-full border border-blue-400/25 bg-blue-400/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-200/95">
              Synced
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-base text-white/55">
            Inventory valuation, stock-out risk, and revenue tied to movement, full
            view for retail and warehouse teams.
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active SKUs", value: "18,420", sub: "Across 3 sites" },
          { label: "Inventory value", value: formatPhp(42_800_000), sub: "FIFO estimate" },
          { label: "Out of stock", value: "37", sub: "Below reorder point" },
          { label: "Sell-through (30d)", value: "94%", sub: "Vs. prior month" },
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
            Revenue
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Trailing 12 months (₱ thousands)
          </h2>
          <p className="mt-1 text-sm text-white/45">Consolidated Scanly sales channels</p>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue12} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(167,139,250,0.45)" />
                    <stop offset="100%" stopColor="rgba(167,139,250,0)" />
                  </linearGradient>
                  <linearGradient id="scSt" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(248,250,252,0.06)" vertical={false} />
                <XAxis dataKey="m" tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  formatter={(v: number) => [formatPhpThousandsK(v), "Rev"]}
                />
                <Area type="monotone" dataKey="k" stroke="url(#scSt)" strokeWidth={2.5} fill="url(#scRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5" delay={0.1}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Assortment
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Share by category</h2>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryMix} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="4 8" stroke="rgba(248,250,252,0.06)" horizontal={false} />
                <XAxis type="number" domain={[0, 40]} tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="cat" width={88} tick={{ fill: "rgba(248,250,252,0.45)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  formatter={(v: number) => [`${v}%`, "Share"]}
                />
                <Bar dataKey="pct" fill="#818cf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-0 overflow-hidden" delay={0.12}>
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-base font-semibold text-white">Reorder watchlist</h2>
          <p className="mt-1 text-sm text-white/45">SKUs at or below minimum — demo data.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Site</th>
                <th className="px-5 py-3 font-medium">On hand</th>
                <th className="px-5 py-3 font-medium">MOQ</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {lowStock.map((row) => (
                <tr key={row.sku} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-white/60">{row.sku}</td>
                  <td className="px-5 py-3 font-medium text-white">{row.name}</td>
                  <td className="px-5 py-3 text-white/55">{row.loc}</td>
                  <td className="px-5 py-3 tabular-nums">
                    <span className={row.oh === 0 ? "text-rose-300/95" : "text-amber-200/95"}>
                      {row.oh}
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-white/50">{row.moq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
