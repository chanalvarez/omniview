"use client";

import { AuthNav } from "@/components/AuthNav";
import { OmniViewLogo } from "@/components/OmniViewLogo";
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
      className="fixed left-0 top-0 z-20 flex h-[100dvh] w-14 flex-col items-center border-r border-white/[0.07] bg-[rgba(15,23,42,0.45)] py-4 pb-3 backdrop-blur-xl"
      aria-label="Primary"
    >
      <Link
        href="/"
        className="mb-6 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
        title="OmniView Home"
      >
        <OmniViewLogo size="sm" />
      </Link>
      <nav className="flex flex-col gap-1">
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
