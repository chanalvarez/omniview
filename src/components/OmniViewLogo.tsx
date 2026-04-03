"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type OmniViewLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  withWordmark?: boolean;
};

const sizeMap = {
  sm: { px: 36, text: "text-lg" },
  md: { px: 44, text: "text-xl" },
  lg: { px: 56, text: "text-2xl md:text-3xl" },
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
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 1 }}
        className="shrink-0"
      >
        <Image
          src="/omniview-logo.png"
          alt="OmniView"
          width={s.px}
          height={s.px}
          priority
        />
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
