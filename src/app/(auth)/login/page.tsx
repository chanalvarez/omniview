"use client";

import { OmniViewLogo } from "@/components/OmniViewLogo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Mode = "signin" | "register";

const glassPane =
  "relative w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/10 bg-[rgba(15,23,42,0.38)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl " +
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(145deg,rgba(255,255,255,0.1)_0%,transparent_50%)] before:opacity-60";

const glassButtonClass =
  "group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-transparent px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:border-transparent hover:shadow-[0_0_32px_rgba(59,130,246,0.35)] disabled:opacity-50";

function LoginPortalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "register") setMode("register");
  }, [searchParams]);

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and anon key.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    const next = searchParams.get("next") || "/";
    router.push(next.startsWith("/") ? next : "/");
    router.refresh();
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMode("signin");
    setPassword("");
    setError(null);
    router.push("/login?registered=1");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[440px]"
    >
      <div className={`${glassPane} px-8 pb-10 pt-9`}>
        <div className="relative z-[1] flex flex-col items-center text-center">
          <OmniViewLogo size="lg" withWordmark />
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.28em] text-blue-200/55">
            Portal
          </p>
        </div>

        <div className="relative z-[1] mt-8 flex justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              mode === "signin"
                ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              mode === "register"
                ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                : "text-white/45 hover:text-white/75"
            }`}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, rotateY: -10 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
              className="relative z-[1] mt-8"
            >
              <form onSubmit={submitSignIn} className="space-y-4">
                <div>
                  <label
                    htmlFor="si-email"
                    className="mb-1.5 block text-left text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Email
                  </label>
                  <input
                    id="si-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/25 focus:ring-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="si-password"
                    className="mb-1.5 block text-left text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Password
                  </label>
                  <input
                    id="si-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/25 focus:ring-2"
                    required
                  />
                </div>
                {error ? (
                  <p className="text-sm text-rose-300/95">{error}</p>
                ) : null}
                {searchParams.get("registered") === "1" ? (
                  <p className="text-sm text-emerald-300/90">
                    Check your email to confirm, then sign in.
                  </p>
                ) : null}
                <div className="pt-2">
                  <button type="submit" disabled={loading} className={glassButtonClass}>
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-violet-600/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <span className="relative z-[1]">
                      {loading ? "Signing in…" : "Login"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, rotateY: 10 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
              className="relative z-[1] mt-8"
            >
              <form onSubmit={submitRegister} className="space-y-4">
                <div>
                  <label
                    htmlFor="reg-name"
                    className="mb-1.5 block text-left text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Full name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/25 focus:ring-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-email"
                    className="mb-1.5 block text-left text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/25 focus:ring-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-password"
                    className="mb-1.5 block text-left text-xs font-medium uppercase tracking-wider text-white/45"
                  >
                    Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/25 focus:ring-2"
                    required
                    minLength={6}
                  />
                </div>
                {error ? (
                  <p className="text-sm text-rose-300/95">{error}</p>
                ) : null}
                <div className="pt-2">
                  <button type="submit" disabled={loading} className={glassButtonClass}>
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-violet-600/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                    <span className="relative z-[1]">
                      {loading ? "Creating…" : "Create account"}
                    </span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-[320px] w-full max-w-[440px] items-center justify-center rounded-3xl border border-white/10 bg-[rgba(15,23,42,0.35)] text-sm text-white/45 backdrop-blur-xl">
      Loading portal…
    </div>
  );
}

export default function LoginPortalPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPortalInner />
    </Suspense>
  );
}
