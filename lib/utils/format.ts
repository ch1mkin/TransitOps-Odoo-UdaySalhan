const inrCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrCurrencyPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Indian number grouping (e.g. 1,00,000). */
export function formatNumber(value: number, maximumFractionDigits?: number) {
  return new Intl.NumberFormat("en-IN", {
    ...(maximumFractionDigits != null ? { maximumFractionDigits } : {}),
  }).format(value);
}

/** Indian rupee format (e.g. ₹1,00,000). */
export function formatCurrency(value: number, options?: { decimals?: boolean }) {
  return (options?.decimals ? inrCurrencyPrecise : inrCurrency).format(value);
}

/** Short Indian currency labels for chart axes (K / L / Cr). */
export function formatCompactCurrency(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_00_00_000) {
    return `${sign}₹${formatNumber(abs / 1_00_00_000, 1)}Cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${formatNumber(abs / 1_00_000, 1)}L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${formatNumber(abs / 1_000, 1)}K`;
  }

  return formatCurrency(value);
}
