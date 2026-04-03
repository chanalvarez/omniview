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
    <div className="relative z-[1] flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-white/[0.07] bg-[rgba(3,7,18,0.35)] px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {hydrated ? (
                <p className="font-[family-name:var(--font-geist-sans)] text-lg font-bold tracking-tight text-white md:text-xl">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-white to-white/85 bg-clip-text text-transparent">
                    {displayName}
                  </span>
                </p>
              ) : (
                <div className="h-7 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
              )}
              <p className="mt-0.5 text-sm text-white/45">
                Your portfolio intelligence at a glance
              </p>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
