"use client";

import { GlassCard } from "@/components/GlassCard";
import { DataExplorer } from "@/components/dashboard/DataExplorer";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatPhpCompact } from "@/lib/format/php";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import type { ExploreResponse, ExploreTable } from "@/app/api/businesses/[id]/explore/route";
import {
  Activity,
  ArrowLeft,
  Database,
  Link2,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { sumColumn } from "@/lib/integrations/fetch-table-data";
import { isDemoMode, showDemoRestriction } from "@/lib/demo";
import { DemoBusinessDetail } from "@/components/dashboard/DemoBusinessDetail";

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildMockTrend(seed: number) {
  const base = 40 + (seed % 35);
  return Array.from({ length: 9 }, (_, i) => ({
    m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"][i],
    v: Math.round(base + i * 3 + (seed >> (i % 4)) % 8),
  }));
}

/** Pick the "best" table for overview stats (most rows, or revenue-shaped). */
function pickPrimaryTable(tables: ExploreTable[]): ExploreTable | null {
  if (tables.length === 0) return null;
  const revenue = tables.find((t) => t.numericColumns.length > 0 && t.totalCount > 0);
  return revenue ?? tables[0];
}

/** Derive summary KPIs from explore data. */
function deriveKpis(tables: ExploreTable[], seed: number) {
  const primary = pickPrimaryTable(tables);

  const totalRecords = tables.reduce((s, t) => s + t.totalCount, 0);

  let revenueSum = 0;
  let revenueLabel = "Revenue (sample)";
  if (primary?.numericColumns[0]) {
    revenueSum = sumColumn(primary.rows, primary.numericColumns[0]);
    revenueLabel = primary.numericColumns[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const mockPulse = 78 + (seed % 18);
  const mockMomentum = 6 + (seed % 9);

  // Build trend from primary table's date column if available
  let trend: { m: string; v: number }[] = buildMockTrend(seed);
  if (primary?.dateColumn && primary.rows.length > 1) {
    const byMonth: Record<string, number> = {};
    for (const row of primary.rows) {
      const val: unknown = row[primary.dateColumn];
      if (typeof val !== "string") continue;
      const ym = val.slice(0, 7);
      if (!/^\d{4}-\d{2}$/.test(ym)) continue;
      byMonth[ym] = (byMonth[ym] ?? 0) + 1;
    }
    const entries = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length >= 2) {
      trend = entries.map(([ym, count]) => ({
        m: new Date(`${ym}-01`).toLocaleString("default", { month: "short", year: "2-digit" }),
        v: count,
      }));
    }
  }

  return {
    totalRecords,
    revenueSum,
    revenueLabel,
    pulse: mockPulse,
    momentum: mockMomentum,
    trend,
    isLive: tables.length > 0,
  };
}

// ── Page component ────────────────────────────────────────────────────────────

export default function BusinessDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { customEntities, hydrated, cloudMode } = usePortfolioEntities();
  const business = customEntities.find((e) => e.id === id);

  const seed = business ? hashId(business.id) : 0;

  // Integration flag
  const [hasIntegration, setHasIntegration] = useState<boolean | null>(null);

  // Connect form state (for detail-page re-connect / update)
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connectSaving, setConnectSaving] = useState(false);
  const [connectMsg, setConnectMsg] = useState<string | null>(null);

  // Explore data (multi-table)
  const [exploreData, setExploreData] = useState<ExploreTable[]>([]);
  const [exploreCount, setExploreCount] = useState(0);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [exploreLastUpdated, setExploreLastUpdated] = useState<Date | null>(null);
  const exploreIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadIntegrationFlag = useCallback(async () => {
    if (!cloudMode || !id) { setHasIntegration(false); return; }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setHasIntegration(false); return; }
    const { data } = await supabase
      .from("external_connections")
      .select("id")
      .eq("business_id", id)
      .maybeSingle();
    setHasIntegration(!!data);
  }, [cloudMode, id]);

  const loadExplore = useCallback(async (silent = false) => {
    if (!cloudMode || !id) return;
    if (!silent) setExploreLoading(true);
    setExploreError(null);
    try {
      const res = await fetch(`/api/businesses/${id}/explore`, { credentials: "include" });
      const json = (await res.json()) as ExploreResponse;
      if (json.ok) {
        setExploreData(json.tables);
        setExploreCount(json.discoveredCount);
        setExploreLastUpdated(new Date());
      } else {
        setExploreError(json.error ?? "Could not load data.");
      }
    } catch {
      if (!silent) setExploreError("Network error while loading business data.");
    } finally {
      if (!silent) setExploreLoading(false);
    }
  }, [cloudMode, id]);

  useEffect(() => { void loadIntegrationFlag(); }, [loadIntegrationFlag]);

  // Load explore data and set up 60-second auto-refresh
  useEffect(() => {
    if (hasIntegration !== true) return;
    void loadExplore(false);
    exploreIntervalRef.current = setInterval(() => void loadExplore(true), 60_000);
    return () => {
      if (exploreIntervalRef.current) clearInterval(exploreIntervalRef.current);
    };
  }, [hasIntegration, loadExplore]);

  const submitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode()) {
      showDemoRestriction();
      return;
    }
    setConnectMsg(null);
    setConnectSaving(true);
    try {
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          business_id: id,
          base_url: baseUrl.trim(),
          api_key: apiKey.trim(),
          metrics_path: "/rest/v1/",
          provider: "servewise",
        }),
      });
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) { setConnectMsg(json.error ?? "Connection failed."); return; }
      setApiKey("");
      setConnectMsg("Saved. Loading data…");
      setHasIntegration(true);
      await loadExplore();
      setConnectMsg("Connected. Data loaded below.");
    } catch {
      setConnectMsg("Network error.");
    } finally {
      setConnectSaving(false);
    }
  };

  // ── Loading / not found ──────────────────────────────────────────────────

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
        <Link href="/entities" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Businesses
        </Link>
        <GlassCard className="mt-8 p-8" delay={0}>
          <p className="text-white/70">This business was not found.</p>
          <Link href="/entities" className="mt-4 inline-block text-sm font-medium text-blue-300/90 transition hover:text-white">
            Go to Businesses
          </Link>
        </GlassCard>
      </div>
    );
  }

  // In demo mode show fully self-contained fake analytics — no real API calls.
  if (isDemoMode()) {
    return <DemoBusinessDetail business={business} />;
  }

  const kpis = deriveKpis(exploreData, seed);

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      {/* Back */}
      <Link href="/entities" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Businesses
      </Link>

      {/* Header */}
      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">Your business</p>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95">
            <Sparkles className="h-3 w-3" aria-hidden />
            {cloudMode ? "Cloud" : "Local"}
          </span>
          {hasIntegration && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-400/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-300/90">
              <Database className="h-3 w-3" aria-hidden />
              ServeWise connected
            </span>
          )}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{business.name}</h1>
        {business.tagline ? (
          <p className="mt-2 text-lg text-white/55">{business.tagline}</p>
        ) : (
          <p className="mt-2 text-base text-white/45">
            {cloudMode
              ? hasIntegration
                ? "Live data from ServeWise below."
                : "Connect ServeWise below to see your live business data."
              : "Sign in for cloud sync, then connect ServeWise."}
          </p>
        )}
      </header>

      {/* Connect card */}
      {!cloudMode ? (
        <GlassCard className="mt-6 p-5" delay={0.05}>
          <p className="text-sm text-white/60">
            Stored on this device only.{" "}
            <Link href="/login" className="font-medium text-blue-300/90 hover:text-white">Sign in</Link>{" "}
            to sync and connect ServeWise.
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="mt-6 p-6" delay={0.05}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Link2 className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              {hasIntegration && !showConnectForm ? (
                /* ── Already connected: show status + update toggle ── */
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">ServeWise connected</h2>
                    <p className="mt-0.5 text-sm text-emerald-300/80">
                      Live data is loading below.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConnectForm(true)}
                    className="shrink-0 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/55 transition hover:bg-white/[0.1] hover:text-white/80"
                  >
                    Update credentials
                  </button>
                </div>
              ) : (
                /* ── Connect / update form ── */
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-white">
                      {hasIntegration ? "Update credentials" : "Connect ServeWise"}
                    </h2>
                    {hasIntegration && (
                      <button
                        onClick={() => setShowConnectForm(false)}
                        className="text-xs text-white/40 hover:text-white/70"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-white/50">
                    Enter your <strong className="text-white/70">Supabase project URL</strong>{" "}
                    (e.g. <code className="text-white/65">https://xxxx.supabase.co</code>) and the{" "}
                    <strong className="text-white/70">anon public</strong> key from Supabase →
                    Project Settings → API.
                  </p>
                  <form onSubmit={submitConnect} className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                        Supabase project URL
                      </label>
                      <input
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="https://xxxx.supabase.co"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                        Anon public key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
                        autoComplete="off"
                      />
                    </div>
                    {connectMsg && <p className="text-sm text-white/55">{connectMsg}</p>}
                    <button
                      type="submit"
                      disabled={connectSaving || !baseUrl.trim() || !apiKey.trim()}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12] disabled:opacity-40"
                    >
                      {connectSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save &amp; connect
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Explore error */}
      {exploreError && cloudMode && (
        <p className="mt-4 text-sm text-amber-200/90">Data note: {exploreError}</p>
      )}

      {/* ── Overview KPIs (derived from real data when available) ── */}
      {cloudMode && hasIntegration && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total records */}
            <GlassCard className="p-5" delay={0.06}>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                Total records
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-white">
                {exploreLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                ) : (
                  kpis.totalRecords.toLocaleString()
                )}
              </p>
              <p className="mt-1 text-sm text-white/45">
                {kpis.isLive ? `Across ${exploreData.length} table${exploreData.length !== 1 ? "s" : ""}` : "Preview"}
              </p>
            </GlassCard>

            {/* Revenue / numeric sum */}
            <GlassCard className="p-5" delay={0.07}>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                {kpis.isLive && kpis.revenueSum > 0 ? kpis.revenueLabel : "Revenue signal"}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {exploreLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                ) : kpis.isLive && kpis.revenueSum > 0 ? (
                  formatPhpCompact(kpis.revenueSum)
                ) : (
                  formatPhpCompact((420 + (seed % 180)) * 1000)
                )}
              </p>
              <p className="mt-1 text-sm text-white/45">
                {kpis.isLive && kpis.revenueSum > 0 ? "Shown records" : "Preview"}
              </p>
            </GlassCard>

            {/* Tables accessed */}
            <GlassCard className="p-5" delay={0.08}>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                Data sources
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                {exploreLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                ) : (
                  exploreData.length
                )}
              </p>
              <p className="mt-1 text-sm text-white/45">
                {exploreCount > 0 ? `${exploreCount} in schema` : "Tables / views"}
              </p>
            </GlassCard>

            {/* Momentum */}
            <GlassCard className="p-5" delay={0.09}>
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">Momentum</p>
              <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums text-white">
                <TrendingUp className="h-6 w-6 text-emerald-400/90" strokeWidth={2} />
                +{kpis.momentum}%
              </p>
              <p className="mt-1 text-sm text-white/45">Estimated</p>
            </GlassCard>
          </div>

          {/* Activity trend chart */}
          <div className="mt-6">
            <GlassCard className="p-5" delay={0.1}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                    <Activity className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                      Performance
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">Activity index</h2>
                    <p className="text-xs text-white/35">
                      {kpis.isLive ? "Records per month · primary table" : "Preview data"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {exploreLastUpdated && (
                    <span className="text-[10px] text-white/25">
                      Updated {exploreLastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  )}
                  <button
                    onClick={() => void loadExplore(false)}
                    disabled={exploreLoading}
                    className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-40"
                    title="Refresh data"
                  >
                    <RefreshCw className={`h-4 w-4 ${exploreLoading ? "animate-spin" : ""}`} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
              <div className="mt-4 h-[200px]">
                {exploreLoading ? (
                  <div className="flex h-full items-center justify-center text-white/45">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpis.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="bizArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                          <stop offset="100%" stopColor="rgba(96,165,250,0)" />
                        </linearGradient>
                        <linearGradient id="bizSt" x1="0" y1="1" x2="1" y2="0">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#a78bfa" />
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
                        formatter={(v: number) => [v, kpis.isLive ? "Records" : "Index"]}
                      />
                      <Area type="monotone" dataKey="v" stroke="url(#bizSt)" strokeWidth={2.5} fill="url(#bizArea)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCard>
          </div>

          {/* ── Data Explorer ── */}
          <div className="mt-8">
            <GlassCard className="p-6" delay={0.11}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                  <Database className="h-5 w-5 text-purple-300/85" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Data Explorer</h2>
                  <p className="text-xs text-white/40">
                    {exploreLoading
                      ? "Discovering tables…"
                      : exploreData.length > 0
                        ? `${exploreData.length} accessible table${exploreData.length !== 1 ? "s" : ""} from ServeWise`
                        : "All accessible tables from your ServeWise Supabase project"}
                  </p>
                </div>
              </div>
              <DataExplorer
                tables={exploreData}
                loading={exploreLoading}
                discoveredCount={exploreCount}
              />
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}
