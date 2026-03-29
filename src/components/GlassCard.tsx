"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type GlassCardProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function GlassCard({
  children,
  className = "",
  delay = 0,
  initial,
  animate,
  transition,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: 14 }}
      animate={animate ?? { opacity: 1, y: 0 }}
      transition={
        transition ?? {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
          delay,
        }
      }
      className={[
        "relative overflow-hidden rounded-2xl border border-white/10",
        "bg-[rgba(15,23,42,0.6)] backdrop-blur-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
        "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,transparent_42%,transparent_100%)]",
        "before:opacity-[0.55]",
        className,
      ].join(" ")}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
