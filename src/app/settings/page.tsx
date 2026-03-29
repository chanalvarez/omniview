import { GlassCard } from "@/components/GlassCard";
import { Settings2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <Settings2 className="h-5 w-5 text-white/70" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-white/50">
            Workspace preferences, integrations, and who can see what.
          </p>
        </div>
      </header>

      <GlassCard className="space-y-4 p-8">
        <p className="text-base leading-relaxed text-white/70">
          This is the <strong className="font-medium text-white/90">control room</strong> for
          OmniView: Supabase auth and row-level security for multi-tenant data, API
          keys for third-party tools, notification rules, currency/locale defaults
          (you&apos;re on <strong className="font-medium text-white/90">PHP</strong> in the
          UI), and team access. The sidebar links here so you have a dedicated
          place for configuration separate from day-to-day KPIs on Home.
        </p>
        <p className="text-sm text-white/45">
          Like Financials, this page is intentionally high-level until you add real
          settings forms and persistence.
        </p>
      </GlassCard>
    </div>
  );
}
