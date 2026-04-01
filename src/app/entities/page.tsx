"use client";

import { AddEntityModal } from "@/components/AddEntityModal";
import { ConfirmDeleteEntityModal } from "@/components/ConfirmDeleteEntityModal";
import { EditEntityModal } from "@/components/EditEntityModal";
import { GlassCard } from "@/components/GlassCard";
import type { CustomEntity } from "@/context/portfolio-entities-context";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { Building2, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function BusinessesPage() {
  const {
    addEntity,
    customEntities,
    hydrated,
    removeEntity,
    updateEntity,
  } = usePortfolioEntities();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<CustomEntity | null>(null);
  const [deleting, setDeleting] = useState<CustomEntity | null>(null);

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
            <Building2 className="h-5 w-5 text-white/70" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Businesses</h1>
            <p className="text-sm text-white/50">
              Companies you monitor in OmniView. Add a name to connect each one.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.12]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          New business
        </button>
      </header>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
          Your businesses
          {!hydrated ? (
            <span className="ml-2 font-normal normal-case text-white/35">
              Loading…
            </span>
          ) : null}
        </h2>

        {customEntities.length === 0 && hydrated ? (
          <GlassCard className="p-8 text-center" delay={0}>
            <p className="text-white/55">
              No businesses yet. Use <strong className="font-medium text-white/80">New business</strong>{" "}
              or the <strong className="font-medium text-white/80">Add a business</strong> card on Home.
              Just enter a name, OmniView connects it for you.
            </p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              Add your first business
            </button>
          </GlassCard>
        ) : (
          <ul className="space-y-2">
            {customEntities.map((e) => (
              <li key={e.id} className="flex items-stretch gap-2">
                <Link
                  href={`/entities/${e.id}`}
                  className="min-w-0 flex-1 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
                >
                  <GlassCard
                    className="h-full p-4 transition hover:border-white/[0.14] hover:bg-[rgba(15,23,42,0.72)]"
                    delay={0}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-white">{e.name}</p>
                          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300/95">
                            Connected
                          </span>
                        </div>
                        {e.tagline ? (
                          <p className="mt-0.5 truncate text-sm text-white/50">
                            {e.tagline}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-sm text-white/40">
                            Linked to your workspace
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-white/40"
                        aria-hidden
                      />
                    </div>
                  </GlassCard>
                </Link>
                <div className="flex shrink-0 flex-col gap-1.5 py-0.5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => setEditing(e)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                    aria-label={`Edit ${e.name}`}
                    title="Edit business"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(e)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/[0.07] text-rose-300/90 transition hover:border-rose-400/35 hover:bg-rose-500/15"
                    aria-label={`Delete ${e.name}`}
                    title="Delete business"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddEntityModal open={addOpen} onOpenChange={setAddOpen} onAdd={addEntity} />
      <EditEntityModal
        entity={editing}
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        onSave={(id, input) => updateEntity(id, input)}
      />
      <ConfirmDeleteEntityModal
        entityName={deleting?.name ?? null}
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => {
          if (deleting) void removeEntity(deleting.id);
        }}
      />
    </div>
  );
}
