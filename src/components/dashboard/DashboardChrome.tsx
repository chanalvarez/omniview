"use client";

import { Sidebar } from "@/components/Sidebar";
import { usePortfolioEntities } from "@/context/portfolio-entities-context";

export function DashboardChrome({ children }: { children: React.ReactNode }) {
  const { session, hydrated } = usePortfolioEntities();

  const displayName =
    (session?.user.user_metadata?.full_name as string | undefined)?.trim() ||
    session?.user.email?.split("@")[0] ||
    "there";

  return (
    <div className="relative z-[1] min-h-screen min-h-[100dvh]">
      <Sidebar />
      <div className="flex min-h-screen min-h-[100dvh] min-w-0 flex-col pl-14">
        <header className="shrink-0 border-b border-white/[0.07] bg-[rgba(3,7,18,0.35)] px-4 py-3 backdrop-blur-xl sm:px-5 md:px-8 md:py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
            <div className="min-w-0 flex-1">
              {hydrated ? (
                <p className="font-[family-name:var(--font-geist-sans)] text-base font-bold tracking-tight text-white md:text-lg">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-white to-white/85 bg-clip-text text-transparent">
                    {displayName}
                  </span>
                </p>
              ) : (
                <div className="h-6 w-40 animate-pulse rounded-lg bg-white/[0.06] md:h-7" />
              )}
              <p className="mt-0.5 max-w-2xl text-xs leading-snug text-white/50 md:text-sm md:leading-relaxed">
                Unified glass cockpit for your operating companies, revenue, risk, and
                runway in one calm view.
              </p>
            </div>
          </div>
        </header>
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
