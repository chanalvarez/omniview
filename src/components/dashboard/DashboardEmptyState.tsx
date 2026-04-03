"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";

type DashboardEmptyStateProps = {
  onSync: () => void;
};

export function DashboardEmptyState({ onSync }: DashboardEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-4 py-16 text-center md:py-24"
    >
      <div className="relative">
        <div className="absolute inset-0 scale-150 blur-3xl">
          <div className="h-40 w-40 rounded-full bg-blue-500/20" />
        </div>
        <motion.div
          className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-[rgba(15,23,42,0.45)] shadow-[0_0_60px_rgba(59,130,246,0.15)] backdrop-blur-xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          <Radar
            className="h-16 w-16 text-blue-300/80"
            strokeWidth={1.25}
            aria-hidden
          />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-28 w-28 rounded-full border border-sky-400/20" />
        </motion.div>
      </div>

      <h2 className="mt-10 max-w-md text-2xl font-semibold tracking-tight text-white md:text-3xl">
        No businesses linked yet
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-white/50">
        Connect your first app URL and API key. OmniView verifies the link, then pulls
        live metrics into your dashboard.
      </p>
      <button
        type="button"
        onClick={onSync}
        className="mt-8 rounded-2xl border border-white/15 bg-white/[0.07] px-8 py-3.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.11]"
      >
        Sync your first business
      </button>
    </motion.div>
  );
}
