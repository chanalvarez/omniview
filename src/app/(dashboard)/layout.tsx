import { DashboardChrome } from "@/components/dashboard/DashboardChrome";
import { PortfolioEntitiesProvider } from "@/context/portfolio-entities-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortfolioEntitiesProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </PortfolioEntitiesProvider>
  );
}
