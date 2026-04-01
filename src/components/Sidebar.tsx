"use client";

import { AuthNav } from "@/components/AuthNav";
import {
  Building2,
  Home,
  Landmark,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/entities", label: "Businesses", icon: Building2 },
  { href: "/financials", label: "Financials", icon: Landmark },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="relative z-10 flex min-h-screen w-14 shrink-0 flex-col items-center border-r border-white/[0.07] bg-[rgba(15,23,42,0.35)] py-5 backdrop-blur-md"
      aria-label="Primary"
    >
      <div className="mb-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/25 text-[10px] font-bold tracking-tight text-white/90 ring-1 ring-white/10">
        OV
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={[
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  : "text-white/45 hover:bg-white/[0.06] hover:text-white/80",
              ].join(" ")}
            >
              <Icon className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>
      <AuthNav />
    </aside>
  );
}
