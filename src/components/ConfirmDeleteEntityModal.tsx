"use client";

import { GlassCard } from "@/components/GlassCard";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useId } from "react";

type ConfirmDeleteEntityModalProps = {
  entityName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ConfirmDeleteEntityModal({
  entityName,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteEntityModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open || !entityName) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <GlassCard
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] w-full max-w-md p-0 shadow-2xl"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-300/95" strokeWidth={1.75} />
              </div>
              <div>
                <h2 id={titleId} className="text-lg font-semibold text-white">
                  Remove entity?
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  <span className="font-medium text-white/75">{entityName}</span> will be
                  removed from OmniView on this device. This does not delete data in
                  Supabase or other systems.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-white/12 bg-transparent px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="rounded-xl border border-rose-400/35 bg-rose-500/15 px-4 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25"
          >
            Delete entity
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
