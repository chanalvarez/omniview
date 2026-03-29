"use client";

import { GlassCard } from "@/components/GlassCard";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { ArrowLeft, Link2, Settings2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EntityDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { customEntities, hydrated } = usePortfolioEntities();
  const entity = customEntities.find((e) => e.id === id);

  if (!hydrated) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
        <p className="text-sm text-white/50">Loading…</p>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
        <Link
          href="/entities"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Entities
        </Link>
        <GlassCard className="mt-8 p-8" delay={0}>
          <p className="text-white/70">
            This entity was not found. It may have been removed from this browser.
          </p>
          <Link
            href="/entities"
            className="mt-4 inline-block text-sm font-medium text-blue-300/90 transition hover:text-white"
          >
            Go to Entities
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
        Back to Entities
      </Link>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
          Portfolio entity
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          {entity.name}
        </h1>
        {entity.tagline ? (
          <p className="mt-2 text-lg text-white/55">{entity.tagline}</p>
        ) : null}
      </header>

      <div className="mt-8 grid max-w-3xl gap-4">
        <GlassCard className="p-6" delay={0.06}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Link2 className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                How to connect this business
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Adding a name here only registers the entity in OmniView on this
                device. To <strong className="font-medium text-white/80">link live data</strong>{" "}
                (sales, inventory, payroll, etc.), you need a backend mapping:
              </p>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-white/60">
                <li>
                  In <strong className="font-medium text-white/75">Supabase</strong>, give
                  each business a stable tenant or organization id, and store KPIs or
                  facts in tables keyed by that id (use Row Level Security so users only
                  see their tenants).
                </li>
                <li>
                  Point integrations (Stripe, Xero, your ERP, webhooks) at your API or
                  Edge Functions, then write into those tables.
                </li>
                <li>
                  In OmniView, replace the demo numbers with queries filtered by this
                  entity&apos;s id (you can store the Supabase id in app settings when
                  you add a real &quot;connection&quot; form).
                </li>
              </ol>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" delay={0.1}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                <Settings2 className="h-5 w-5 text-violet-300/85" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Integrations</h2>
                <p className="mt-1 text-sm text-white/50">
                  API keys, webhooks, and notification defaults will live under Settings
                  as the product matures.
                </p>
              </div>
            </div>
            <Link
              href="/settings"
              className="shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
            >
              Open Settings
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
