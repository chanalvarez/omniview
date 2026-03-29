"use client";

import { GlassCard } from "@/components/GlassCard";
import { formatPhpCompact } from "@/lib/format/php";
import { AlertTriangle, TrendingUp, Wallet } from "lucide-react";

const PORTFOLIO_REVENUE_PHP = 158_400_000;
const PORTFOLIO_NET_PROFIT_PHP = 34_300_000;

const stats = [
  {
    label: "Total Portfolio Revenue",
    getValue: () => formatPhpCompact(PORTFOLIO_REVENUE_PHP),
    sub: "+12.4% vs last quarter",
    icon: Wallet,
  },
  {
    label: "Total Net Profit",
    getValue: () => formatPhpCompact(PORTFOLIO_NET_PROFIT_PHP),
    sub: "Margin 21.5%",
    icon: TrendingUp,
  },
  {
    label: "Global Alerts",
    getValue: () => "7",
    sub: "2 critical · 5 watchlist",
    icon: AlertTriangle,
  },
] as const;

export function PortfolioStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((s, i) => (
        <GlassCard key={s.label} delay={i * 0.06} className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                {s.getValue()}
              </p>
              <p className="mt-1 text-sm text-white/50">{s.sub}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <s.icon className="h-5 w-5 text-blue-300/90" strokeWidth={1.75} />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
