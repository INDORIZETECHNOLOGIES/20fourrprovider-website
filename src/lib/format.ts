const rupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Every provider-facing money field is integer paise except Wallet and the
// premium analytics endpoints — see CLAUDE.md. Never pass those through this.
export function formatPaise(paise: number): string {
  return rupeeFormatter.format(paise / 100);
}

const exactRupeeFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** To the paisa — for invoice figures the provider must reproduce exactly. */
export function formatPaiseExact(paise: number): string {
  return exactRupeeFormatter.format(paise / 100);
}

export function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
