"use client";

import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type Phase = "idle" | "verifying" | "success" | "error";

type AddEntityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const panelClass =
  "relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(15,23,42,0.42)] backdrop-blur-[22px] shadow-[0_12px_48px_rgba(0,0,0,0.5)] " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(145deg,rgba(255,255,255,0.12)_0%,transparent_45%)] before:opacity-[0.5]";

export function AddEntityModal({ open, onOpenChange }: AddEntityModalProps) {
  const titleId = useId();
  const { connectBusiness } = usePortfolioEntities();

  const [name, setName] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [metricsPath, setMetricsPath] = useState("/v1/metrics");
  const [apiKey, setApiKey] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [shake, setShake] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "verifying" && phase !== "success") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, phase]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setAppUrl("");
    setMetricsPath("/v1/metrics");
    setApiKey("");
    setPhase("idle");
    setShake(false);
    setErrorDetail(null);
  }, [open]);

  const inputError =
    phase === "error"
      ? "border-red-500/35 bg-red-500/[0.07] ring-2 ring-red-500/25 shadow-[0_0_24px_rgba(239,68,68,0.12)]"
      : "border-white/10 bg-white/[0.06] ring-white/5 focus:ring-2 focus:ring-blue-400/35";

  const canSubmit =
    name.trim() &&
    appUrl.trim() &&
    apiKey.trim() &&
    metricsPath.trim() &&
    phase !== "verifying" &&
    phase !== "success";

  const submit = async () => {
    if (!canSubmit) return;
    setErrorDetail(null);
    setPhase("verifying");
    const result = await connectBusiness({
      name: name.trim(),
      baseUrl: appUrl.trim(),
      apiKey: apiKey.trim(),
      metricsPath: metricsPath.trim(),
    });

    if (result.ok) {
      setPhase("success");
      window.setTimeout(() => {
        onOpenChange(false);
      }, 1400);
      return;
    }

    setPhase("error");
    setErrorDetail(result.error);
    setShake(true);
    window.setTimeout(() => setShake(false), 520);
  };

  if (!open) return null;

  const showForm = phase === "idle" || phase === "error";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (phase !== "verifying" && phase !== "success") onOpenChange(false);
        }}
        disabled={phase === "verifying" || phase === "success"}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-[1] w-full max-w-md ${panelClass}`}
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{
          opacity: 1,
          scale: shake ? [1, 0.99, 1.01, 1] : 1,
          y: 0,
        }}
        transition={{
          duration: shake ? 0.45 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative z-[1] border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-white">
              Add business
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={phase === "verifying" || phase === "success"}
              className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Verification: <span className="text-white/65">GET</span> your app URL + metrics path
            (default <code className="text-white/70">/v1/metrics</code>) with{" "}
            <code className="text-white/70">Authorization: Bearer</code>. Use the host where your
            API actually lives — a Vercel landing page often has no metrics route.
          </p>
        </div>

        <div className="relative z-[1] space-y-4 px-5 py-5">
          <AnimatePresence mode="wait">
            {phase === "verifying" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-md" />
                  <div
                    className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-400/90 border-r-sky-400/50"
                    style={{ animationDuration: "0.85s" }}
                  />
                  <div className="absolute inset-[6px] rounded-full bg-[rgba(15,23,42,0.5)] backdrop-blur-sm" />
                </div>
                <p className="mt-5 text-sm font-medium text-white/75">
                  Verifying connection…
                </p>
                <p className="mt-1 text-center text-xs text-white/40">
                  Test ping runs on the server only
                </p>
              </motion.div>
            ) : null}

            {phase === "success" ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10"
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(52,211,153,0)",
                      "0 0 28px 6px rgba(52,211,153,0.45)",
                      "0 0 0 0 rgba(52,211,153,0)",
                    ],
                  }}
                  transition={{ duration: 1.2, repeat: 1, ease: "easeInOut" }}
                >
                  <Check className="h-8 w-8 text-emerald-300" strokeWidth={2.5} />
                </motion.div>
                <p className="mt-5 text-base font-semibold text-emerald-300/95">
                  Connection verified
                </p>
                <p className="mt-1 text-center text-sm text-white/50">
                  Adding your card to the dashboard…
                </p>
              </motion.div>
            ) : null}

            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="biz-name"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Business name
                  </label>
                  <input
                    id="biz-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (phase === "error") {
                        setPhase("idle");
                        setErrorDetail(null);
                      }
                    }}
                    placeholder="e.g. Harbor Logistics"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 ${inputError}`}
                    autoComplete="organization"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="biz-url"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    App URL (API base)
                  </label>
                  <input
                    id="biz-url"
                    value={appUrl}
                    onChange={(e) => {
                      setAppUrl(e.target.value);
                      if (phase === "error") {
                        setPhase("idle");
                        setErrorDetail(null);
                      }
                    }}
                    placeholder="https://api.your-servewise.com"
                    className={`w-full rounded-xl px-3.5 py-2.5 font-mono text-sm text-white outline-none transition placeholder:text-white/35 ${inputError}`}
                    autoComplete="off"
                    inputMode="url"
                  />
                </div>
                <div>
                  <label
                    htmlFor="biz-metrics-path"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Metrics path
                  </label>
                  <input
                    id="biz-metrics-path"
                    value={metricsPath}
                    onChange={(e) => {
                      setMetricsPath(e.target.value);
                      if (phase === "error") {
                        setPhase("idle");
                        setErrorDetail(null);
                      }
                    }}
                    placeholder="/v1/metrics"
                    className={`w-full rounded-xl px-3.5 py-2.5 font-mono text-sm text-white outline-none transition placeholder:text-white/35 ${inputError}`}
                    autoComplete="off"
                  />
                  <p className="mt-1 text-[11px] text-white/35">
                    Must return HTTP 2xx JSON when called with your key.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="biz-key"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    API key
                  </label>
                  <input
                    id="biz-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (phase === "error") {
                        setPhase("idle");
                        setErrorDetail(null);
                      }
                    }}
                    placeholder="••••••••••••"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/35 ${inputError}`}
                    autoComplete="off"
                  />
                </div>

                {phase === "error" ? (
                  <p className="text-sm leading-snug text-red-300/90">
                    {errorDetail ??
                      "Could not verify your API. Check URL, metrics path, and key with your developer."}
                  </p>
                ) : null}

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
                    onClick={() => void submit()}
                    disabled={!canSubmit}
                    className="rounded-xl border border-emerald-400/25 bg-gradient-to-r from-emerald-500/20 to-cyan-500/15 px-4 py-2.5 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Connect
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
