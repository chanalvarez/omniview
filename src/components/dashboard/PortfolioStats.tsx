"use client";

import { GlassCard } from "@/components/GlassCard";
import { formatPhpCompact } from "@/lib/format/php";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { AlertTriangle, TrendingUp, Wallet } from "lucide-react";

const PORTFOLIO_REVENUE_PHP = 158_400_000;
const PORTFOLIO_NET_PROFIT_PHP = 34_300_000;

export function PortfolioStats({ compact = false }: { compact?: boolean }) {
  const { customEntities, hydrated } = usePortfolioEntities();
  const hasBusinesses = hydrated && customEntities.length > 0;
  const pad = compact ? "p-4" : "p-5";

  const stats = [
    {
      label: "Total Portfolio Revenue",
      getValue: () =>
        hasBusinesses ? formatPhpCompact(PORTFOLIO_REVENUE_PHP) : "—",
      sub: hasBusinesses
        ? "+12.4% vs last quarter"
        : "Add a business to populate your portfolio",
      icon: Wallet,
    },
    {
      label: "Total Net Profit",
      getValue: () =>
        hasBusinesses ? formatPhpCompact(PORTFOLIO_NET_PROFIT_PHP) : "—",
      sub: hasBusinesses ? "Margin 21.5%" : "—",
      icon: TrendingUp,
    },
    {
      label: "Global Alerts",
      getValue: () => (hasBusinesses ? "7" : "—"),
      sub: hasBusinesses
        ? "2 critical · 5 watchlist"
        : "No businesses linked yet",
      icon: AlertTriangle,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((s, i) => (
        <GlassCard key={s.label} delay={i * 0.06} className={pad}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
                {s.label}
              </p>
              <p
                className={`mt-1.5 font-semibold tabular-nums tracking-tight text-white ${compact ? "text-2xl" : "text-3xl"}`}
              >
                {s.getValue()}
              </p>
              <p className={`mt-0.5 text-white/50 ${compact ? "text-xs" : "text-sm"}`}>
                {s.sub}
              </p>
            </div>
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] ${compact ? "h-9 w-9" : "h-10 w-10"}`}
            >
              <s.icon
                className={`text-blue-300/90 ${compact ? "h-4 w-4" : "h-5 w-5"}`}
                strokeWidth={1.75}
              />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
