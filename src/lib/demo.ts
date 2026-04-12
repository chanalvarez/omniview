/** True when portfolio demo build (NEXT_PUBLIC_IS_DEMO=true). */
export const isDemoMode = (): boolean =>
  process.env.NEXT_PUBLIC_IS_DEMO === "true";

export const DEMO_RESTRICTION_EVENT = "omniview:demo-restriction";

/** Open the demo restriction modal (client only). */
export function showDemoRestriction(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEMO_RESTRICTION_EVENT));
}
