"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import {
  CHART_AXIS,
  CHART_COLORS,
  CHART_GRID,
  formatCompactDate,
  formatCurrency,
} from "@/components/charts/chart-theme";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { isLicenseExpired } from "@/lib/fleet/trip-lifecycle";
import type { Driver, ExpenseLog, FuelLog, MaintenanceLog, Trip, Vehicle } from "@/types/entities";

export type FleetChartsVariant = "fleet" | "safety" | "financial" | "all";

interface FleetChartsProps {
  variant?: FleetChartsVariant;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: ExpenseLog[];
  maintenanceLogs?: MaintenanceLog[];
}

const STATUS_COLORS: Record<string, string> = {
  Available: CHART_COLORS.success,
  "On Trip": CHART_COLORS.accent,
  "In Shop": CHART_COLORS.warning,
  Retired: CHART_COLORS.muted,
  Suspended: CHART_COLORS.danger,
  Draft: CHART_COLORS.muted,
  Dispatched: CHART_COLORS.accent,
  Completed: CHART_COLORS.success,
  Cancelled: CHART_COLORS.danger,
};

export function FleetCharts({
  variant = "all",
  vehicles,
  drivers,
  trips,
  fuelLogs,
  expenses,
  maintenanceLogs = [],
}: FleetChartsProps) {
  const showFleet = variant === "fleet" || variant === "all";
  const showSafety = variant === "safety" || variant === "all";
  const showFinancial = variant === "financial" || variant === "all";

  const vehicleStatus = useMemo(
    () =>
      Object.entries(
        vehicles.reduce<Record<string, number>>((acc, v) => {
          acc[v.status] = (acc[v.status] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value })),
    [vehicles]
  );

  const tripsByStatus = useMemo(
    () =>
      Object.entries(
        trips.reduce<Record<string, number>>((acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value })),
    [trips]
  );

  const fuelTrend = useMemo(
    () =>
      fuelLogs
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({
          date: formatCompactDate(log.date),
          liters: log.liters,
          cost: log.cost,
        })),
    [fuelLogs]
  );

  const expenseTrend = useMemo(
    () =>
      expenses
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((log) => ({
          date: formatCompactDate(log.date),
          amount: log.amount,
        })),
    [expenses]
  );

  const safetyScores = useMemo(
    () =>
      [...drivers]
        .sort((a, b) => b.safety_score - a.safety_score)
        .slice(0, 8)
        .map((d) => ({
          name: d.name.split(" ")[0],
          score: d.safety_score,
        })),
    [drivers]
  );

  const licenseHealth = useMemo(() => {
    const expired = drivers.filter((d) => isLicenseExpired(d.license_expiry)).length;
    const expiring = drivers.filter((d) => {
      if (isLicenseExpired(d.license_expiry)) return false;
      const days =
        (new Date(d.license_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days <= 30;
    }).length;
    const valid = drivers.length - expired - expiring;
    return [
      { name: "Valid", value: valid },
      { name: "Expiring", value: expiring },
      { name: "Expired", value: expired },
    ];
  }, [drivers]);

  const expenseByCategory = useMemo(() => {
    const map = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenses]);

  const utilization =
    vehicles.filter((v) => v.status !== "Retired").length === 0
      ? 0
      : Math.round(
          (vehicles.filter((v) => v.status === "On Trip").length /
            vehicles.filter((v) => v.status !== "Retired").length) *
            100
        );

  const maintenanceTrend = useMemo(() => {
    const byMonth = maintenanceLogs.reduce<Record<string, number>>((acc, log) => {
      const month = log.opened_at.slice(0, 7);
      acc[month] = (acc[month] ?? 0) + log.cost;
      return acc;
    }, {});
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cost]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        cost,
      }));
  }, [maintenanceLogs]);

  const maintenanceHeatmap = useMemo(() => {
    const types = [...new Set(maintenanceLogs.map((log) => log.maintenance_type))].slice(0, 5);
    const months = [...new Set(maintenanceLogs.map((log) => log.opened_at.slice(0, 7)))]
      .sort()
      .slice(-6);

    return types.map((type) => ({
      type,
      cells: months.map((month) => ({
        month,
        count: maintenanceLogs.filter(
          (log) => log.maintenance_type === type && log.opened_at.startsWith(month)
        ).length,
      })),
    }));
  }, [maintenanceLogs]);

  const heatmapMonths = maintenanceHeatmap[0]?.cells.map((c) => c.month) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {showFleet ? (
        <>
          <ChartCard
            title="Fleet utilization"
            description="Share of active fleet currently on trip"
            footer={`${utilization}% utilization across non-retired vehicles`}
          >
            <div className="flex h-[240px] flex-col items-center justify-center">
              <p className="text-4xl font-semibold tabular-nums tracking-tight">
                {utilization}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Live fleet utilization</p>
              <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${utilization}%` }}
                />
              </div>
            </div>
          </ChartCard>

          <ChartCard
            title="Vehicle status"
            description="Availability and operational state"
            empty={vehicleStatus.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={vehicleStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                >
                  {vehicleStatus.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? CHART_COLORS.muted}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Trip pipeline"
            description="Trips grouped by lifecycle status"
            empty={tripsByStatus.length === 0}
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tripsByStatus} barGap={4}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="name" {...CHART_AXIS} />
                <YAxis allowDecimals={false} {...CHART_AXIS} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Trips" radius={[6, 6, 0, 0]}>
                  {tripsByStatus.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? CHART_COLORS.accent}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Maintenance trends"
            description="Monthly maintenance spend"
            empty={maintenanceTrend.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={maintenanceTrend}>
                <defs>
                  <linearGradient id="maintFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.warning} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.warning} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="month" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={48} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip content={<ChartTooltip valueFormatter={(v) => formatCurrency(v)} />} />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke={CHART_COLORS.warning}
                  fill="url(#maintFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Maintenance frequency"
            description="Service events by type and month"
            empty={maintenanceHeatmap.length === 0}
            footer="Darker cells indicate more maintenance events"
          >
            <div className="overflow-x-auto px-2">
              <table className="w-full min-w-[320px] text-xs">
                <thead>
                  <tr>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Type</th>
                    {heatmapMonths.map((month) => (
                      <th
                        key={month}
                        className="pb-2 text-center font-medium text-muted-foreground"
                      >
                        {new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "short" })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHeatmap.map((row) => (
                    <tr key={row.type}>
                      <td className="py-1.5 pr-3 font-medium">{row.type}</td>
                      {row.cells.map((cell) => (
                        <td key={`${row.type}-${cell.month}`} className="p-1">
                          <div
                            className="mx-auto flex size-8 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums"
                            style={{
                              backgroundColor:
                                cell.count === 0
                                  ? "#F3F4F6"
                                  : `rgba(245, 158, 11, ${0.15 + cell.count * 0.2})`,
                              color: cell.count > 2 ? "#92400E" : "#6B7280",
                            }}
                          >
                            {cell.count || "·"}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </>
      ) : null}

      {showSafety ? (
        <>
          <ChartCard
            title="License compliance"
            description="Valid, expiring, and expired licenses"
            empty={drivers.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={licenseHealth}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                >
                  {licenseHealth.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Expired"
                          ? CHART_COLORS.danger
                          : entry.name === "Expiring"
                            ? CHART_COLORS.warning
                            : CHART_COLORS.success
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Safety scores"
            description="Top drivers by safety rating"
            empty={safetyScores.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={safetyScores} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid {...CHART_GRID} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} {...CHART_AXIS} />
                <YAxis type="category" dataKey="name" {...CHART_AXIS} width={56} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="score" name="Score" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      ) : null}

      {showFinancial ? (
        <>
          <ChartCard
            title="Fuel consumption"
            description="Liters logged over time"
            empty={fuelTrend.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={fuelTrend}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="date" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={40} />
                <Tooltip
                  content={
                    <ChartTooltip
                      valueFormatter={(v, key) =>
                        key === "cost" ? formatCurrency(v) : `${v.toLocaleString()} L`
                      }
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="liters"
                  name="Liters"
                  stroke={CHART_COLORS.success}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: CHART_COLORS.success, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Operational expenses"
            description="Daily expense trend"
            empty={expenseTrend.length === 0}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={expenseTrend}>
                <defs>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.danger} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.danger} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="date" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={48} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  content={
                    <ChartTooltip valueFormatter={(v) => formatCurrency(v)} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Amount"
                  stroke={CHART_COLORS.danger}
                  fill="url(#expenseFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Expense breakdown"
            description="Top categories by spend"
            empty={expenseByCategory.length === 0}
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={expenseByCategory}>
                <CartesianGrid {...CHART_GRID} />
                <XAxis dataKey="name" {...CHART_AXIS} />
                <YAxis
                  {...CHART_AXIS}
                  width={52}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={
                    <ChartTooltip valueFormatter={(v) => formatCurrency(v)} />
                  }
                />
                <Bar dataKey="value" name="Spend" fill={CHART_COLORS.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      ) : null}
    </div>
  );
}
