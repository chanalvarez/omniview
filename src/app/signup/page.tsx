"use client";

import { GlassCard } from "@/components/GlassCard";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
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
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/login");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <GlassCard className="w-full max-w-md p-8" delay={0}>
        <h1 className="text-xl font-semibold text-white">Create account</h1>
        <p className="mt-1 text-sm text-white/50">
          Use the same email you use for OmniView cloud sync.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wider text-white/45">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-wider text-white/45">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none ring-blue-400/30 focus:ring-2"
              required
              minLength={6}
            />
          </div>
          {error ? (
            <p className="text-sm text-rose-300/95">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-white/15 bg-gradient-to-r from-blue-500/25 to-violet-500/25 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white/45">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-300/90 hover:text-white">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
