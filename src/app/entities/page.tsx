"use client";

import { AddEntityModal } from "@/components/AddEntityModal";
import { GlassCard } from "@/components/GlassCard";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { Building2, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BUILT_IN = [
  {
    name: "ServeWise",
    detail: "Scheduling and field appointments, surfaced on Home.",
    badge: "Active",
    badgeClass:
      "border-emerald-400/25 bg-emerald-400/10 text-emerald-300/95",
  },
  {
    name: "Scanly",
    detail: "Inventory counts and stock health, surfaced on Home.",
    badge: "Synced",
    badgeClass: "border-blue-400/25 bg-blue-400/10 text-blue-200/95",
  },
] as const;

export default function EntitiesPage() {
  const { addEntity, customEntities, hydrated } = usePortfolioEntities();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
            <Building2 className="h-5 w-5 text-white/70" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Entities</h1>
            <p className="text-sm text-white/50">
              Every company in your portfolio, built-in products plus entities you
              add.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.12]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New entity
        </button>
      </header>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            OmniView products
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {BUILT_IN.map((row) => (
              <GlassCard key={row.name} className="p-5" delay={0}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{row.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/50">
                      {row.detail}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${row.badgeClass}`}
                  >
                    {row.badge}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
            Your entities
            {!hydrated ? (
              <span className="ml-2 font-normal normal-case text-white/35">
                Loading…
              </span>
            ) : null}
          </h2>
          {customEntities.length === 0 && hydrated ? (
            <GlassCard className="p-8 text-center" delay={0}>
              <p className="text-white/55">
                You haven&apos;t added a custom entity yet. Use{" "}
                <strong className="font-medium text-white/80">New entity</strong>{" "}
                or the <strong className="font-medium text-white/80">Add a business</strong>{" "}
                card on Home.
              </p>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add your first entity
              </button>
            </GlassCard>
          ) : (
            <ul className="space-y-2">
              {customEntities.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/entities/${e.id}`}
                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
                  >
                    <GlassCard
                      className="p-4 transition hover:border-white/[0.14] hover:bg-[rgba(15,23,42,0.72)]"
                      delay={0}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-white">{e.name}</p>
                          {e.tagline ? (
                            <p className="mt-0.5 truncate text-sm text-white/50">
                              {e.tagline}
                            </p>
                          ) : null}
                        </div>
                        <ChevronRight
                          className="h-5 w-5 shrink-0 text-white/40"
                          aria-hidden
                        />
                      </div>
                    </GlassCard>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AddEntityModal open={addOpen} onOpenChange={setAddOpen} onAdd={addEntity} />
    </div>
  );
}
