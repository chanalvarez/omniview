"use client";

import { GlassCard } from "@/components/GlassCard";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatPhpCompact, formatPhpThousandsK } from "@/lib/format/php";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import {
  Activity,
  ArrowLeft,
  Link2,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildTrend(seed: number) {
  const base = 40 + (seed % 35);
  return Array.from({ length: 9 }, (_, i) => ({
    m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"][i],
    v: Math.round(base + i * 3 + (seed >> (i % 4)) % 8),
  }));
}

type MetricsApi = {
  connected: boolean;
  source: "live" | "error" | "none";
  error?: string;
  metrics?: {
    revenuePhp: number;
    healthScore: number;
    momentumPct: number;
    attentionItems: number;
    trend: { m: string; v: number }[];
  };
};

export default function BusinessDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { customEntities, hydrated, cloudMode } = usePortfolioEntities();
  const business = customEntities.find((e) => e.id === id);

  const seed = business ? hashId(business.id) : 0;
  const mockTrend = buildTrend(seed);
  const mockPulse = 78 + (seed % 18);
  const mockRevK = 420 + (seed % 180);

  const [hasIntegration, setHasIntegration] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<MetricsApi | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [metricsPath, setMetricsPath] = useState("/v1/metrics");
  const [connectSaving, setConnectSaving] = useState(false);
  const [connectMsg, setConnectMsg] = useState<string | null>(null);

  const loadIntegrationFlag = useCallback(async () => {
    if (!cloudMode || !id) {
      setHasIntegration(false);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setHasIntegration(false);
      return;
    }
    const { data } = await supabase
      .from("external_connections")
      .select("id")
      .eq("business_id", id)
      .maybeSingle();
    setHasIntegration(!!data);
  }, [cloudMode, id]);

  const loadMetrics = useCallback(async () => {
    if (!cloudMode || !id) return;
    setMetricsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${id}/metrics`, {
        credentials: "include",
      });
      const json = (await res.json()) as MetricsApi;
      setMetrics(json);
    } catch {
      setMetrics({
        connected: false,
        source: "none",
        error: "Could not load metrics.",
      });
    } finally {
      setMetricsLoading(false);
    }
  }, [cloudMode, id]);

  useEffect(() => {
    void loadIntegrationFlag();
  }, [loadIntegrationFlag]);

  useEffect(() => {
    if (hasIntegration === true) void loadMetrics();
  }, [hasIntegration, loadMetrics]);

  const submitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
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
          metrics_path: metricsPath.trim() || "/v1/metrics",
          provider: "servewise",
        }),
      });
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setConnectMsg(json.error ?? "Connection failed.");
        return;
      }
      setApiKey("");
      setConnectMsg("Saved. Syncing metrics…");
      setHasIntegration(true);
      await loadMetrics();
      setConnectMsg("Connected. Metrics update below.");
    } catch {
      setConnectMsg("Network error.");
    } finally {
      setConnectSaving(false);
    }
  };

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
        <Link
          href="/entities"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Businesses
        </Link>
        <GlassCard className="mt-8 p-8" delay={0}>
          <p className="text-white/70">
            This business was not found. It may have been removed from this device.
          </p>
          <Link
            href="/entities"
            className="mt-4 inline-block text-sm font-medium text-blue-300/90 transition hover:text-white"
          >
            Go to Businesses
          </Link>
        </GlassCard>
      </div>
    );
  }

  const m = metrics?.metrics;
  const fromApi = Boolean(metrics?.connected && m);
  const errLine = metrics?.error;

  const pulse = m?.healthScore ?? mockPulse;
  const revDisplay = m
    ? formatPhpCompact(m.revenuePhp)
    : formatPhpCompact(mockRevK * 1000);
  const momentum = m?.momentumPct ?? 6 + (seed % 9);
  const attention = m?.attentionItems ?? 2 + (seed % 4);
  const trendData = m?.trend ?? mockTrend;

  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <Link
        href="/entities"
        className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to Businesses
      </Link>

      <header className="mt-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Your business
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300/95">
            <Sparkles className="h-3 w-3" aria-hidden />
            {cloudMode ? "Cloud" : "Local"}
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          {business.name}
        </h1>
        {business.tagline ? (
          <p className="mt-2 text-lg text-white/55">{business.tagline}</p>
        ) : (
          <p className="mt-2 text-base text-white/45">
            {cloudMode
              ? "Connect ServeWise below to pull live KPIs."
              : "Sign in for cloud sync, then connect your ServeWise integration API keys."}
          </p>
        )}
      </header>

      {!cloudMode ? (
        <GlassCard className="mt-6 p-5" delay={0.05}>
          <p className="text-sm text-white/60">
            This business is stored on this device only.{" "}
            <Link href="/login" className="font-medium text-blue-300/90 hover:text-white">
              Sign in
            </Link>{" "}
            to sync to the cloud and connect ServeWise with your API credentials.
          </p>
        </GlassCard>
      ) : (
        <GlassCard className="mt-6 p-6" delay={0.05}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Link2 className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-white">
                Connect ServeWise
              </h2>
              <p className="mt-1 text-sm text-white/50">
                OmniView calls your ServeWise HTTPS API using a bearer token. Set the
                base URL (e.g. <code className="text-white/70">https://api.your-servewise.com</code>
                ), metrics path (your API&apos;s summary endpoint), and integration API key. Adjust{" "}
                <code className="text-white/70">normalize-metrics.ts</code> if field names differ.
              </p>
              {hasIntegration ? (
                <p className="mt-2 text-xs font-medium text-emerald-300/90">
                  Integration saved. {metricsLoading ? "Loading metrics…" : null}
                </p>
              ) : null}
              <form onSubmit={submitConnect} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                    Base URL
                  </label>
                  <input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.servewise.example"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                    Metrics path
                  </label>
                  <input
                    value={metricsPath}
                    onChange={(e) => setMetricsPath(e.target.value)}
                    placeholder="/v1/metrics"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-white/45">
                    Integration API key / bearer token
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
                {connectMsg ? (
                  <p className="text-sm text-white/55">{connectMsg}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={connectSaving || !baseUrl.trim() || !apiKey.trim()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12] disabled:opacity-40"
                >
                  {connectSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Save &amp; sync
                </button>
              </form>
            </div>
          </div>
        </GlassCard>
      )}

      {errLine && cloudMode ? (
        <p className="mt-4 text-sm text-amber-200/90">
          API note: {errLine}
        </p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5" delay={0.06}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Health pulse
          </p>
          <p className="mt-2 flex items-baseline gap-1 text-3xl font-semibold tabular-nums text-white">
            {pulse}
            <span className="text-lg text-white/40">/100</span>
          </p>
          <p className="mt-1 text-sm text-white/45">
            {fromApi && metrics?.source === "live"
              ? "Live · ServeWise"
              : fromApi
                ? "From API (check warning below)"
                : "Preview"}
          </p>
        </GlassCard>
        <GlassCard className="p-5" delay={0.07}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Revenue signal
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
            {revDisplay}
          </p>
          <p className="mt-1 text-sm text-white/45">PHP (normalized)</p>
        </GlassCard>
        <GlassCard className="p-5" delay={0.08}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Attention items
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-amber-200/95">
            {attention}
          </p>
        </GlassCard>
        <GlassCard className="p-5" delay={0.09}>
          <p className="text-xs font-medium uppercase tracking-wider text-white/45">
            Momentum
          </p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tabular-nums text-white">
            <TrendingUp className="h-6 w-6 text-emerald-400/90" strokeWidth={2} />+
            {momentum}%
          </p>
        </GlassCard>
      </div>

      <div className="mt-6">
        <GlassCard className="p-5" delay={0.1}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
              <Activity className="h-5 w-5 text-blue-300/85" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                Performance
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">Activity index</h2>
              <div className="mt-4 h-[260px]">
                {metricsLoading ? (
                  <div className="flex h-full items-center justify-center text-white/45">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="bizArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                          <stop offset="100%" stopColor="rgba(96,165,250,0)" />
                        </linearGradient>
                        <linearGradient id="bizSt" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 8"
                        stroke="rgba(248,250,252,0.06)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="m"
                        tick={{ fill: "rgba(248,250,252,0.4)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "rgba(248,250,252,0.35)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(15,23,42,0.94)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        formatter={(value: number) => [formatPhpThousandsK(value), "Index"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="url(#bizSt)"
                        strokeWidth={2.5}
                        fill="url(#bizArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
