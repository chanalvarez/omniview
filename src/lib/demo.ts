/** True when portfolio demo build (NEXT_PUBLIC_IS_DEMO=true). */
export const isDemoMode = (): boolean =>
  process.env.NEXT_PUBLIC_IS_DEMO === "true";

/** Generic demo restriction (register, addEntity, etc.). */
export const DEMO_RESTRICTION_EVENT = "omniview:demo-restriction";

/** Shown specifically when "Connect business" is clicked. */
export const DEMO_CONNECT_EVENT = "omniview:demo-connect";

/** Open the generic demo restriction modal (client only). */
export function showDemoRestriction(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEMO_RESTRICTION_EVENT));
}

/** Open the "Connect business" demo modal (client only). */
export function showDemoConnect(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DEMO_CONNECT_EVENT));
}
