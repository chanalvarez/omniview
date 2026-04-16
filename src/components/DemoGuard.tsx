"use client";

import {
  DEMO_CONNECT_EVENT,
  DEMO_RESTRICTION_EVENT,
  isDemoMode,
} from "@/lib/demo";
import { useEffect, useState } from "react";

const FIVERR_URL = "https://www.fiverr.com/chanalvarez";

const bannerStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  color: "white",
  fontSize: 13,
  padding: "10px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  gap: 12,
  flexWrap: "wrap",
};

function DemoRestrictionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-restriction-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[rgba(15,23,42,0.96)] p-6 shadow-2xl">
        <h2
          id="demo-restriction-title"
          className="text-lg font-semibold text-white"
        >
          Demo Restriction
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          This action is disabled in demo mode. Contact me to see the full
          version.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Got it
          </button>
          <a
            href={FIVERR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/25"
          >
            Hire Me on Fiverr
          </a>
        </div>
      </div>
    </div>
  );
}

function DemoConnectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-connect-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[rgba(15,23,42,0.96)] p-6 shadow-2xl">
        <h2 id="demo-connect-title" className="text-lg font-semibold text-white">
          This is a demo
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Connecting a real business is disabled in demo mode. This feature is
          available in the full product — contact me to get started.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Got it
          </button>
          <a
            href={FIVERR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/25"
          >
            Contact Me
          </a>
        </div>
      </div>
    </div>
  );
}

export function DemoGuard({ children }: { children: React.ReactNode }) {
  const demo = isDemoMode();
  const [restrictionOpen, setRestrictionOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  useEffect(() => {
    if (!demo) return;
    const onRestrict = () => setRestrictionOpen(true);
    const onConnect  = () => setConnectOpen(true);
    window.addEventListener(DEMO_RESTRICTION_EVENT, onRestrict);
    window.addEventListener(DEMO_CONNECT_EVENT,     onConnect);
    return () => {
      window.removeEventListener(DEMO_RESTRICTION_EVENT, onRestrict);
      window.removeEventListener(DEMO_CONNECT_EVENT,     onConnect);
    };
  }, [demo]);

  if (!demo) {
    return <>{children}</>;
  }

  return (
    <>
      <div style={bannerStyle}>
        <span className="max-w-[min(100%,42rem)] leading-snug">
          🔍 Demo Mode — Data is simulated. This is a portfolio preview.
        </span>
        <a
          href={FIVERR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15"
        >
          View on Fiverr
        </a>
      </div>
      <div className="pt-[52px]">{children}</div>
      <DemoRestrictionModal
        open={restrictionOpen}
        onClose={() => setRestrictionOpen(false)}
      />
      <DemoConnectModal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
      />
    </>
  );
}
