"use client";

import { usePortfolioEntities } from "@/context/portfolio-entities-context";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";

export function AuthNav() {
  const { session, supabaseReady, signOut } = usePortfolioEntities();

  if (!supabaseReady) {
    return (
      <div className="mt-auto px-1 pb-2">
        <p className="px-1 text-center text-[10px] leading-tight text-white/35">
          Local only
        </p>
      </div>
    );
  }

  if (session?.user) {
    const email = session.user.email ?? "Account";
    return (
      <div className="flex w-full flex-col items-center gap-2 border-t border-white/[0.06] px-0.5 pb-2 pt-3">
        <span
          className="max-w-[3.5rem] truncate text-center text-[10px] leading-tight text-white/45"
          title={email}
        >
          {email}
        </span>
        <button
          type="button"
          onClick={() => void signOut()}
          title="Sign out"
          className="flex w-full flex-col items-center gap-1 rounded-xl py-2 text-white/55 transition hover:bg-white/[0.08] hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden />
          <span className="text-[10px] font-medium leading-none">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-white/[0.06] px-1 pb-2 pt-3">
      <Link
        href="/login"
        title="Sign in for cloud sync"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/[0.08] hover:text-white"
      >
        <LogIn className="h-[18px] w-[18px] stroke-[1.75]" />
        <span className="sr-only">Sign in</span>
      </Link>
    </div>
  );
}
