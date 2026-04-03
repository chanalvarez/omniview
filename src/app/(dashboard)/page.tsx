import { EntityGrid } from "@/components/dashboard/EntityGrid";
import { PortfolioPerformanceChart } from "@/components/dashboard/PortfolioPerformanceChart";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";

export default function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 py-4 sm:px-5 md:gap-3 md:px-8 md:py-3 lg:px-12">
      <header className="shrink-0 max-w-4xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Executive dashboard
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-3">
        <div className="shrink-0">
          <PortfolioStats compact />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <EntityGrid homeLayout />
        </div>
        <div className="shrink-0">
          <PortfolioPerformanceChart compact />
        </div>
      </div>
    </div>
  );
}
