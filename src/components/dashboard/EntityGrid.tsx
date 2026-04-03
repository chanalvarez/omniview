"use client";

import { AddEntityModal } from "@/components/AddEntityModal";
import { BusinessConnectionAlert } from "@/components/dashboard/BusinessConnectionAlert";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { GlassCard } from "@/components/GlassCard";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Building2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function EntityGrid() {
  const { customEntities, hydrated } = usePortfolioEntities();
  const [addOpen, setAddOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  if (customEntities.length === 0) {
    return (
      <>
        <DashboardEmptyState onSync={() => setAddOpen(true)} />
        <AddEntityModal open={addOpen} onOpenChange={setAddOpen} />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {customEntities.map((b, i) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 32,
                mass: 0.85,
              }}
              className="min-w-0"
            >
              <Link
                href={`/entities/${b.id}`}
                className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
              >
                <GlassCard
                  delay={0.12 + i * 0.04}
                  className="flex h-full flex-col p-5 transition group-hover:border-white/[0.14] group-hover:bg-[rgba(15,23,42,0.72)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                        <Building2
                          className="h-5 w-5 text-violet-300/85"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Your business
                        </p>
                        <h3 className="mt-0.5 truncate text-lg font-semibold text-white">
                          {b.name}
                        </h3>
                        {b.tagline ? (
                          <p className="mt-1 truncate text-sm text-white/50">
                            {b.tagline}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-white/45">
                            {b.integrationConnected
                              ? "Live metrics from your API."
                              : "Connect an API on the detail page."}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={
                        b.integrationConnected
                          ? "shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95"
                          : "shrink-0 rounded-full border border-amber-400/25 bg-amber-400/8 px-2.5 py-0.5 text-[11px] font-medium text-amber-200/90"
                      }
                    >
                      {b.integrationConnected ? "Connected" : "Pending"}
                    </span>
                  </div>
                  <BusinessConnectionAlert
                    businessId={b.id}
                    integrationConnected={b.integrationConnected}
                  />
                  <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-xs text-white/50">
                    <span>Open dashboard for KPIs and trends</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 shrink-0 text-white/35 transition group-hover:text-white/55"
                      aria-hidden
                    />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

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
              <Plus
                className="h-7 w-7 text-white/45 transition group-hover:text-white/65"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">Add a business</h3>
            <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-white/45">
              App URL and API key — verified before anything is stored.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/[0.1]"
          >
            Connect business
          </button>
        </GlassCard>
      </div>

      <AddEntityModal open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
