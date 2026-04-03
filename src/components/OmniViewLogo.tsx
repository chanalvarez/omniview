"use client";

import { motion } from "framer-motion";

type OmniViewLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  withWordmark?: boolean;
};

const sizeMap = {
  sm: { mark: "h-8 w-8", text: "text-lg" },
  md: { mark: "h-11 w-11", text: "text-xl" },
  lg: { mark: "h-14 w-14", text: "text-2xl md:text-3xl" },
};

export function OmniViewLogo({
  size = "md",
  className = "",
  withWordmark = false,
}: OmniViewLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`relative flex ${s.mark} shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[rgba(15,23,42,0.55)] shadow-[0_0_28px_rgba(59,130,246,0.18)] backdrop-blur-xl`}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
      >
        <span
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(96,165,250,0.35)_0%,rgba(167,139,250,0.28)_50%,transparent_100%)]"
          aria-hidden
        />
        <span className="relative text-[11px] font-bold tracking-tight text-white/95">
          OV
        </span>
      </motion.div>
      {withWordmark ? (
        <span
          className={`font-semibold uppercase tracking-[0.35em] text-white ${s.text}`}
        >
          OmniView
        </span>
      ) : null}
    </div>
  );
}
