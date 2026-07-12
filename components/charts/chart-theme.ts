export interface ChartTheme {
  id: "light" | "dark";
  colors: {
    primary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    muted: string;
    series: readonly string[];
  };
  axis: {
    tick: { fill: string; fontSize: number };
    axisLine: { stroke: string };
    tickLine: false;
  };
  grid: {
    stroke: string;
    strokeDasharray: string;
    vertical: boolean;
  };
  legend: string;
  heatmap: {
    empty: string;
    textLow: string;
    textHigh: string;
  };
}

export const LIGHT_CHART_THEME: ChartTheme = {
  id: "light",
  colors: {
    primary: "#2563EB",
    accent: "#3B82F6",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    muted: "#6B7280",
    series: ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0891B2"],
  },
  axis: {
    tick: { fill: "#6B7280", fontSize: 11 },
    axisLine: { stroke: "#D1D5DB" },
    tickLine: false,
  },
  grid: {
    stroke: "#E5E7EB",
    strokeDasharray: "4 4",
    vertical: false,
  },
  legend: "#6B7280",
  heatmap: {
    empty: "#F3F4F6",
    textLow: "#6B7280",
    textHigh: "#92400E",
  },
};

export const DARK_CHART_THEME: ChartTheme = {
  id: "dark",
  colors: {
    primary: "#60A5FA",
    accent: "#3B82F6",
    success: "#4ADE80",
    warning: "#FBBF24",
    danger: "#F87171",
    muted: "#94A3B8",
    series: ["#60A5FA", "#4ADE80", "#FBBF24", "#F87171", "#A78BFA", "#22D3EE"],
  },
  axis: {
    tick: { fill: "#94A3B8", fontSize: 11 },
    axisLine: { stroke: "#475569" },
    tickLine: false,
  },
  grid: {
    stroke: "#334155",
    strokeDasharray: "4 4",
    vertical: false,
  },
  legend: "#94A3B8",
  heatmap: {
    empty: "#1E293B",
    textLow: "#94A3B8",
    textHigh: "#FCD34D",
  },
};

export function buildStatusColors(colors: ChartTheme["colors"]): Record<string, string> {
  return {
    Available: colors.success,
    "On Trip": colors.accent,
    "In Shop": colors.warning,
    Retired: colors.muted,
    Suspended: colors.danger,
    Draft: colors.muted,
    Dispatched: colors.accent,
    Completed: colors.success,
    Cancelled: colors.danger,
  };
}

export { formatCurrency, formatCompactCurrency, formatNumber } from "@/lib/utils/format";

export function formatCompactDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
