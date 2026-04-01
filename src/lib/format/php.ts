/** Philippine Peso — dashboard-wide formatting (en-PH locale). */

const compact = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  notation: "compact",
  maximumFractionDigits: 2,
});

const standard = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

export function formatPhp(amount: number): string {
  return standard.format(amount);
}

/** e.g. 158_400_000 → "₱158.4M" (locale-dependent compact string). */
export function formatPhpCompact(amount: number): string {
  return compact.format(amount);
}

/** Chart axis: value is in millions PHP. */
export function formatPhpAxisMillions(millions: number): string {
  return `₱${millions}M`;
}

/** Thousands for small charts (e.g. monthly revenue in ₱K). */
export function formatPhpThousandsK(thousands: number): string {
  return `₱${thousands}K`;
}
