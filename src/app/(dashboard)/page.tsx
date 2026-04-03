import { EntityGrid } from "@/components/dashboard/EntityGrid";
import { PortfolioPerformanceChart } from "@/components/dashboard/PortfolioPerformanceChart";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";

export default function HomePage() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <header className="mb-10 max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Executive dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/55">
          Unified glass cockpit for your operating companies, revenue, risk, and runway
          in one calm view.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <PortfolioStats />
        <EntityGrid />
        <PortfolioPerformanceChart />
      </div>
    </div>
  );
}
