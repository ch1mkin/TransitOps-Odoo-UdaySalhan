export const CHART_COLORS = {
  primary: "#111827",
  accent: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  muted: "#9CA3AF",
  series: ["#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#6B7280", "#8B5CF6"],
} as const;

export const CHART_AXIS = {
  tick: { fill: "#6B7280", fontSize: 11 },
  axisLine: { stroke: "#E5E7EB" },
  tickLine: false as const,
};

export const CHART_GRID = {
  stroke: "#F3F4F6",
  strokeDasharray: "4 4",
  vertical: false,
};

export { formatCurrency, formatCompactCurrency, formatNumber } from "@/lib/utils/format";

export function formatCompactDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
