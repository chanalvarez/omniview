/**
 * Maps arbitrary JSON from ServeWise (or similar REST APIs) into OmniView metrics.
 * Adjust field names here to match your real ServeWise API response.
 */

export type NormalizedMetrics = {
  revenuePhp: number;
  healthScore: number;
  momentumPct: number;
  attentionItems: number;
  trend: { m: string; v: number }[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function defaultTrend(seed: number): { m: string; v: number }[] {
  const base = 40 + (seed % 30);
  return MONTHS.map((m, i) => ({
    m,
    v: Math.round(base + i * 2 + (seed >> (i % 4)) % 6),
  }));
}

export function normalizeExternalMetrics(
  raw: unknown,
  seed: number,
): NormalizedMetrics {
  if (typeof raw !== "object" || raw === null) {
    return {
      revenuePhp: 0,
      healthScore: 75,
      momentumPct: 8,
      attentionItems: 2,
      trend: defaultTrend(seed),
    };
  }

  const o = raw as Record<string, unknown>;

  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && !Number.isNaN(v)
      ? v
      : typeof v === "string"
        ? Number.parseFloat(v) || fallback
        : fallback;

  const revenuePhp = num(
    o.revenue_php ?? o.revenuePhp ?? o.total_revenue_php ?? o.revenue,
    1_200_000,
  );

  const healthScore = Math.min(
    100,
    Math.max(
      0,
      num(o.health_score ?? o.healthScore ?? o.pulse ?? o.score, 82),
    ),
  );

  const momentumPct = num(
    o.momentum_pct ?? o.momentumPct ?? o.growth_pct,
    7,
  );

  const attentionItems = Math.max(
    0,
    Math.round(num(o.attention_items ?? o.alerts ?? o.warnings, 2)),
  );

  let trend: { m: string; v: number }[] = defaultTrend(seed);
  const t = o.trend ?? o.series ?? o.chart;
  if (Array.isArray(t) && t.length > 0) {
    trend = t.slice(0, 9).map((point, i) => {
      if (typeof point === "number") {
        return { m: MONTHS[i % 9] ?? `M${i}`, v: point };
      }
      if (typeof point === "object" && point !== null) {
        const p = point as Record<string, unknown>;
        return {
          m: String(p.month ?? p.m ?? MONTHS[i % 9] ?? i),
          v: num(p.value ?? p.v ?? p.y, 40 + i),
        };
      }
      return { m: MONTHS[i % 9] ?? `M${i}`, v: 40 + i };
    });
  }

  return {
    revenuePhp,
    healthScore,
    momentumPct,
    attentionItems,
    trend,
  };
}
