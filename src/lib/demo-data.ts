/** Fake analytics data for OmniView demo mode. */

export type DemoChartPoint = { m: string; v: number };

export type DemoKpi = {
  label: string;
  value: string;
  sub: string;
  up?: boolean;
};

export type DemoBizStats = {
  tagline: string;
  industry: string;
  kpis: [DemoKpi, DemoKpi, DemoKpi, DemoKpi];
  revenueChart: DemoChartPoint[];
  activityChart: DemoChartPoint[];
  momentum: number;
  dataSources: number;
  totalRecords: number;
  primaryMetricLabel: string;
  primaryMetricValue: string;
};

const NORTHWIND: DemoBizStats = {
  tagline: "Regional wholesale & distribution",
  industry: "Wholesale · Distribution",
  kpis: [
    { label: "Monthly Revenue",  value: "₱8.24M",  sub: "+14.2% vs last month",    up: true  },
    { label: "Profit Margin",    value: "23.1%",   sub: "Net margin · trailing 3 mo", up: true },
    { label: "Active Orders",    value: "1,482",   sub: "342 pending fulfillment"            },
    { label: "Growth Rate",      value: "+14.2%",  sub: "Month-over-month",         up: true  },
  ],
  revenueChart: [
    { m: "Aug", v: 5.8 }, { m: "Sep", v: 6.1 }, { m: "Oct", v: 6.7 },
    { m: "Nov", v: 7.0 }, { m: "Dec", v: 7.4 }, { m: "Jan", v: 7.1 },
    { m: "Feb", v: 7.6 }, { m: "Mar", v: 7.9 }, { m: "Apr", v: 8.24 },
  ],
  activityChart: [
    { m: "Aug", v: 980  }, { m: "Sep", v: 1020 }, { m: "Oct", v: 1100 },
    { m: "Nov", v: 1180 }, { m: "Dec", v: 1250 }, { m: "Jan", v: 1190 },
    { m: "Feb", v: 1310 }, { m: "Mar", v: 1380 }, { m: "Apr", v: 1482 },
  ],
  momentum: 14,
  dataSources: 5,
  totalRecords: 12_847,
  primaryMetricLabel: "Monthly Revenue",
  primaryMetricValue: "₱8.24M",
};

const STERLING: DemoBizStats = {
  tagline: "Specialty retail cafés & B2B supply",
  industry: "Food & Beverage · Retail",
  kpis: [
    { label: "Monthly Revenue",  value: "₱3.41M",  sub: "+28.7% vs last month",   up: true  },
    { label: "Profit Margin",    value: "31.5%",   sub: "Industry avg: 18–22%",   up: true  },
    { label: "Daily Footfall",   value: "2,140",   sub: "Across 6 café locations"            },
    { label: "Repeat Customers", value: "68%",     sub: "+5pp vs prior quarter",  up: true  },
  ],
  revenueChart: [
    { m: "Aug", v: 1.9 }, { m: "Sep", v: 2.1 }, { m: "Oct", v: 2.3 },
    { m: "Nov", v: 2.5 }, { m: "Dec", v: 2.8 }, { m: "Jan", v: 2.6 },
    { m: "Feb", v: 2.9 }, { m: "Mar", v: 3.1 }, { m: "Apr", v: 3.41 },
  ],
  activityChart: [
    { m: "Aug", v: 1400 }, { m: "Sep", v: 1520 }, { m: "Oct", v: 1650 },
    { m: "Nov", v: 1780 }, { m: "Dec", v: 1970 }, { m: "Jan", v: 1820 },
    { m: "Feb", v: 1950 }, { m: "Mar", v: 2060 }, { m: "Apr", v: 2140 },
  ],
  momentum: 29,
  dataSources: 4,
  totalRecords: 8_305,
  primaryMetricLabel: "Monthly Revenue",
  primaryMetricValue: "₱3.41M",
};

const HARBORLINE: DemoBizStats = {
  tagline: "Last-mile fulfillment & warehousing",
  industry: "Logistics · Supply Chain",
  kpis: [
    { label: "Monthly Revenue",   value: "₱5.92M",  sub: "+9.3% vs last month",    up: true   },
    { label: "Profit Margin",     value: "15.8%",   sub: "Net margin, post-fuel",   up: true   },
    { label: "Deliveries / mo.",  value: "11,240",  sub: "97.4% on-time rate"                  },
    { label: "Fleet Utilisation", value: "88.2%",   sub: "34 active vehicles",      up: false  },
  ],
  revenueChart: [
    { m: "Aug", v: 4.4 }, { m: "Sep", v: 4.6 }, { m: "Oct", v: 4.9 },
    { m: "Nov", v: 5.1 }, { m: "Dec", v: 5.3 }, { m: "Jan", v: 5.0 },
    { m: "Feb", v: 5.4 }, { m: "Mar", v: 5.7 }, { m: "Apr", v: 5.92 },
  ],
  activityChart: [
    { m: "Aug", v: 8200  }, { m: "Sep", v: 8600  }, { m: "Oct", v: 9100  },
    { m: "Nov", v: 9400  }, { m: "Dec", v: 9800  }, { m: "Jan", v: 9300  },
    { m: "Feb", v: 10100 }, { m: "Mar", v: 10700 }, { m: "Apr", v: 11240 },
  ],
  momentum: 9,
  dataSources: 6,
  totalRecords: 28_430,
  primaryMetricLabel: "Monthly Revenue",
  primaryMetricValue: "₱5.92M",
};

const VERTEX: DemoBizStats = {
  tagline: "B2B subscription analytics platform",
  industry: "SaaS · Analytics",
  kpis: [
    { label: "MRR",           value: "₱1.01M",  sub: "+42.1% YoY",             up: true  },
    { label: "Profit Margin", value: "67.2%",   sub: "Gross margin (SaaS avg: 70–80%)", up: true },
    { label: "Active Seats",  value: "4,870",   sub: "212 enterprise accounts"           },
    { label: "Churn Rate",    value: "1.8%",    sub: "Monthly — industry avg: 3.2%", up: true },
  ],
  revenueChart: [
    { m: "Aug", v: 0.58 }, { m: "Sep", v: 0.63 }, { m: "Oct", v: 0.70 },
    { m: "Nov", v: 0.76 }, { m: "Dec", v: 0.82 }, { m: "Jan", v: 0.87 },
    { m: "Feb", v: 0.92 }, { m: "Mar", v: 0.97 }, { m: "Apr", v: 1.01 },
  ],
  activityChart: [
    { m: "Aug", v: 3200 }, { m: "Sep", v: 3450 }, { m: "Oct", v: 3700 },
    { m: "Nov", v: 3900 }, { m: "Dec", v: 4050 }, { m: "Jan", v: 4180 },
    { m: "Feb", v: 4380 }, { m: "Mar", v: 4640 }, { m: "Apr", v: 4870 },
  ],
  momentum: 42,
  dataSources: 3,
  totalRecords: 4_870,
  primaryMetricLabel: "MRR",
  primaryMetricValue: "₱1.01M",
};

/** Fallback for any demo business not matched by name. */
const FALLBACK: DemoBizStats = {
  tagline: "Growing business",
  industry: "Operations",
  kpis: [
    { label: "Monthly Revenue",  value: "₱2.80M",  sub: "+11.5% vs last month",   up: true },
    { label: "Profit Margin",    value: "19.4%",   sub: "Net margin",              up: true },
    { label: "Total Records",    value: "6,240",   sub: "Across all data sources"           },
    { label: "Growth Rate",      value: "+11.5%",  sub: "Month-over-month",        up: true },
  ],
  revenueChart: [
    { m: "Aug", v: 1.7 }, { m: "Sep", v: 1.9 }, { m: "Oct", v: 2.1 },
    { m: "Nov", v: 2.2 }, { m: "Dec", v: 2.4 }, { m: "Jan", v: 2.3 },
    { m: "Feb", v: 2.5 }, { m: "Mar", v: 2.7 }, { m: "Apr", v: 2.8 },
  ],
  activityChart: [
    { m: "Aug", v: 4100 }, { m: "Sep", v: 4400 }, { m: "Oct", v: 4700 },
    { m: "Nov", v: 4900 }, { m: "Dec", v: 5200 }, { m: "Jan", v: 5000 },
    { m: "Feb", v: 5400 }, { m: "Mar", v: 5800 }, { m: "Apr", v: 6240 },
  ],
  momentum: 11,
  dataSources: 4,
  totalRecords: 6_240,
  primaryMetricLabel: "Monthly Revenue",
  primaryMetricValue: "₱2.80M",
};

export function getDemoBizStats(businessName: string): DemoBizStats {
  const n = businessName.toLowerCase();
  if (n.includes("northwind"))                        return NORTHWIND;
  if (n.includes("sterling") || n.includes("coffee")) return STERLING;
  if (n.includes("harbor")   || n.includes("harbor")) return HARBORLINE;
  if (n.includes("vertex")   || n.includes("saas"))   return VERTEX;
  return FALLBACK;
}
