"use client";

import { useEffect, useState } from "react";

type MetricsJson = {
  connected?: boolean;
  source?: string;
};

export function BusinessConnectionAlert({
  businessId,
  integrationConnected,
}: {
  businessId: string;
  integrationConnected?: boolean;
}) {
  const [issue, setIssue] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!integrationConnected) {
      setChecked(true);
      setIssue(false);
      return;
    }
    let cancelled = false;
    void fetch(`/api/businesses/${businessId}/metrics`, { credentials: "include" })
      .then((r) => r.json() as Promise<MetricsJson>)
      .then((j) => {
        if (cancelled) return;
        const ok = j.connected === true && j.source === "live";
        setIssue(!ok);
        setChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setIssue(true);
        setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, integrationConnected]);

  if (!integrationConnected || !checked || !issue) return null;

  return (
    <div className="mt-3 rounded-xl border border-rose-400/25 bg-[rgba(127,29,29,0.2)] px-3 py-2 text-center text-[11px] font-medium leading-snug text-rose-100/95 shadow-[0_0_24px_rgba(244,63,94,0.12)] backdrop-blur-md">
      Connection issue — contact IT
    </div>
  );
}
