"use client";

import { GlassCard } from "@/components/GlassCard";
import type { CustomEntity } from "@/context/portfolio-entities-context";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type EditEntityModalProps = {
  entity: CustomEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, input: { name: string; tagline: string }) => boolean;
};

export function EditEntityModal({
  entity,
  open,
  onOpenChange,
  onSave,
}: EditEntityModalProps) {
  const titleId = useId();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open && entity) {
      setName(entity.name);
      setTagline(entity.tagline);
    }
  }, [open, entity]);

  if (!open || !entity) return null;

  const submit = () => {
    const ok = onSave(entity.id, {
      name: name.trim(),
      tagline: tagline.trim(),
    });
    if (ok) onOpenChange(false);
  };

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
            <h2 id={titleId} className="text-lg font-semibold text-white">
              Edit entity
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Update the display name or description for this business.
          </p>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div>
            <label
              htmlFor="edit-entity-name"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45"
            >
              Business name
            </label>
            <input
              id="edit-entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
              autoComplete="organization"
            />
          </div>
          <div>
            <label
              htmlFor="edit-entity-tagline"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45"
            >
              Short description{" "}
              <span className="font-normal normal-case text-white/35">(optional)</span>
            </label>
            <input
              id="edit-entity-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border border-white/12 bg-transparent px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!name.trim()}
              className="rounded-xl border border-white/15 bg-gradient-to-r from-blue-500/25 to-violet-500/25 px-4 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save changes
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
