import { GlassCard } from "@/components/GlassCard";
import { Landmark } from "lucide-react";

export default function FinancialsPage() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-10 lg:px-12">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <Landmark className="h-5 w-5 text-white/70" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">Financials</h1>
          <p className="text-sm text-white/50">
            Money across your portfolio, P&amp;L, cash, and rollups by business.
          </p>
        </div>
      </header>

      <GlassCard className="space-y-4 p-8">
        <p className="text-base leading-relaxed text-white/70">
          This area is reserved for <strong className="font-medium text-white/90">financial reporting</strong>
          : income statements, balance sheet summaries, burn rate, consolidated
          numbers in <strong className="font-medium text-white/90">PHP</strong>, and
          per-business breakdowns. The Home dashboard already shows high-level
          revenue and profit; Financials is where you drill into statements and
          export views once your accounting data is connected.
        </p>
        <p className="text-sm text-white/45">
          This section is prepared for detailed statements and exports as your ledger
          and data connections come online.
        </p>
      </GlassCard>
    </div>
  );
}
