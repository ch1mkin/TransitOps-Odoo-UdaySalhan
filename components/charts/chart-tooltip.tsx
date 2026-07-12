"use client";

import { formatCurrency, formatNumber } from "@/lib/utils/format";

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[];
  label?: string;
  valueFormatter?: (value: number, key?: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label ? (
        <p className="mb-1.5 font-medium text-foreground">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry) => {
          const value = Number(entry.value ?? 0);
          const formatted =
            valueFormatter?.(value, entry.dataKey) ??
            (entry.dataKey === "cost" ||
            entry.dataKey === "amount" ||
            entry.dataKey === "revenue" ||
            entry.dataKey === "profit"
              ? formatCurrency(value)
              : formatNumber(value));

          return (
            <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color ?? "#2563EB" }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="ml-auto font-semibold tabular-nums text-foreground">
                {formatted}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
