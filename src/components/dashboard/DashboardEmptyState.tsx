"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";

type DashboardEmptyStateProps = {
  onSync: () => void;
  compact?: boolean;
};

export function DashboardEmptyState({ onSync, compact = false }: DashboardEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col items-center justify-center px-4 text-center ${
        compact
          ? "max-h-full min-h-0 gap-2 py-6 md:gap-1 md:py-4"
          : "py-16 md:py-24"
      }`}
    >
      <div className={`relative ${compact ? "scale-90 md:scale-95" : ""}`}>
        <div className={`absolute inset-0 blur-3xl ${compact ? "scale-125" : "scale-150"}`}>
          <div
            className={`rounded-full bg-blue-500/20 ${compact ? "h-28 w-28" : "h-40 w-40"}`}
          />
        </div>
        <motion.div
          className={`relative flex items-center justify-center rounded-full border border-white/10 bg-[rgba(15,23,42,0.45)] shadow-[0_0_60px_rgba(59,130,246,0.15)] backdrop-blur-xl ${
            compact ? "h-28 w-28 md:h-32 md:w-32" : "h-36 w-36"
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <Radar
            className={`text-blue-300/80 ${compact ? "h-12 w-12 md:h-14 md:w-14" : "h-16 w-16"}`}
            strokeWidth={1.25}
            aria-hidden
          />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div
            className={`rounded-full border border-sky-400/20 ${compact ? "h-20 w-20" : "h-28 w-28"}`}
          />
        </motion.div>
      </div>

      <h2
        className={`max-w-md font-semibold tracking-tight text-white ${
          compact
            ? "mt-4 text-lg md:mt-3 md:text-xl"
            : "mt-10 text-2xl md:text-3xl"
        }`}
      >
        No businesses linked yet
      </h2>
      <p
        className={`max-w-lg leading-relaxed text-white/50 ${
          compact ? "mt-1 text-xs md:text-sm" : "mt-3 text-base"
        }`}
      >
        Connect your first app URL and API key. OmniView verifies the link, then pulls live
        metrics into your dashboard.
      </p>
      <button
        type="button"
        onClick={onSync}
        className={`rounded-2xl border border-white/15 bg-white/[0.07] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.11] ${
          compact
            ? "mt-4 px-6 py-2.5 text-xs md:mt-3 md:px-8 md:py-3 md:text-sm"
            : "mt-8 px-8 py-3.5 text-sm"
        }`}
      >
        Sync your first business
      </button>
    </motion.div>
  );
}
