"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type EntityDetailBackProps = {
  href?: string;
  label?: string;
};

export function EntityDetailBack({
  href = "/",
  label = "Back to dashboard",
}: EntityDetailBackProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} />
      {label}
    </Link>
  );
}
