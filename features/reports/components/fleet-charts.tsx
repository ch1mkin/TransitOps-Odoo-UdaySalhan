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
  buildStatusColors,
  formatCompactDate,
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
} from "@/components/charts/chart-theme";
import { useChartTheme } from "@/components/charts/use-chart-theme";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { isLicenseExpired } from "@/lib/fleet/trip-lifecycle";
import {
  computeAverageFuelEfficiency,
  getTopPerformingDrivers,
} from "@/lib/fleet/metrics";
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

export function FleetCharts({
  variant = "all",
  vehicles,
  drivers,
  trips,
  fuelLogs,
  expenses,
  maintenanceLogs = [],
}: FleetChartsProps) {
  const chart = useChartTheme();
  const statusColors = buildStatusColors(chart.colors);

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

  const fuelEfficiency = computeAverageFuelEfficiency(trips, fuelLogs);

  const fuelEfficiencyTrend = useMemo(() => {
    return fuelLogs
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((log) => ({
        date: formatCompactDate(log.date),
        kmPerLiter:
          log.liters > 0 ? Math.round((log.odometer / log.liters) * 10) / 10 : 0,
      }));
  }, [fuelLogs]);

  const topDrivers = useMemo(
    () => getTopPerformingDrivers(drivers, trips),
    [drivers, trips]
  );

  return (
    <div key={chart.id} className="grid gap-4 lg:grid-cols-2">
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
                      fill={statusColors[entry.name] ?? chart.colors.muted}
                    />
                  ))}
                </Pie>
                <Tooltip cursor={false} content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8, color: chart.legend }}
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
                <CartesianGrid {...chart.grid} />
                <XAxis dataKey="name" {...chart.axis} />
                <YAxis allowDecimals={false} {...chart.axis} width={32} />
                <Tooltip cursor={false} content={<ChartTooltip />} />
                <Bar dataKey="value" name="Trips" radius={[6, 6, 0, 0]}>
                  {tripsByStatus.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[entry.name] ?? chart.colors.accent}
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
                    <stop offset="0%" stopColor={chart.colors.warning} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chart.colors.warning} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chart.grid} />
                <XAxis dataKey="month" {...chart.axis} />
                <YAxis {...chart.axis} width={48} tickFormatter={formatCompactCurrency} />
                <Tooltip cursor={false} content={<ChartTooltip valueFormatter={(v) => formatCurrency(v)} />} />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke={chart.colors.warning}
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
                                  ? chart.heatmap.empty
                                  : `rgba(245, 158, 11, ${0.15 + cell.count * 0.2})`,
                              color:
                                cell.count > 2
                                  ? chart.heatmap.textHigh
                                  : chart.heatmap.textLow,
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
          <ChartCard
            title="Fuel efficiency"
            description="Fleet average and per-fill efficiency trend"
            footer={`Fleet average: ${fuelEfficiency} km/L`}
          >
            <div className="flex h-[240px] flex-col items-center justify-center border-b border-border pb-3">
              <p className="text-3xl font-semibold tabular-nums tracking-tight">
                {fuelEfficiency} km/L
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Average across completed trips</p>
            </div>
            {fuelEfficiencyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={fuelEfficiencyTrend}>
                  <CartesianGrid {...chart.grid} />
                  <XAxis dataKey="date" {...chart.axis} />
                  <YAxis {...chart.axis} width={40} />
                  <Tooltip
                    cursor={false}
                    content={
                      <ChartTooltip valueFormatter={(v) => `${v} km/L`} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="kmPerLiter"
                    name="Efficiency"
                    stroke={chart.colors.success}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
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
                          ? chart.colors.danger
                          : entry.name === "Expiring"
                            ? chart.colors.warning
                            : chart.colors.success
                      }
                    />
                  ))}
                </Pie>
                <Tooltip cursor={false} content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingTop: 8, color: chart.legend }}
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
                <CartesianGrid {...chart.grid} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} {...chart.axis} />
                <YAxis type="category" dataKey="name" {...chart.axis} width={56} />
                <Tooltip cursor={false} content={<ChartTooltip />} />
                <Bar dataKey="score" name="Score" fill={chart.colors.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard
            title="Top performing drivers"
            description="Completed trips and safety score composite"
            empty={topDrivers.length === 0}
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topDrivers}>
                <CartesianGrid {...chart.grid} />
                <XAxis dataKey="name" {...chart.axis} />
                <YAxis allowDecimals={false} {...chart.axis} width={32} />
                <Tooltip cursor={false} content={<ChartTooltip />} />
                <Bar
                  dataKey="completedTrips"
                  name="Completed trips"
                  fill={chart.colors.accent}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="safetyScore"
                  name="Safety score"
                  fill={chart.colors.success}
                  radius={[6, 6, 0, 0]}
                />
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
                <CartesianGrid {...chart.grid} />
                <XAxis dataKey="date" {...chart.axis} />
                <YAxis {...chart.axis} width={40} />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltip
                      valueFormatter={(v, key) =>
                        key === "cost" ? formatCurrency(v) : `${formatNumber(v)} L`
                      }
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="liters"
                  name="Liters"
                  stroke={chart.colors.success}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: chart.colors.success, strokeWidth: 0 }}
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
                    <stop offset="0%" stopColor={chart.colors.danger} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chart.colors.danger} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chart.grid} />
                <XAxis dataKey="date" {...chart.axis} />
                <YAxis {...chart.axis} width={48} tickFormatter={formatCompactCurrency} />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltip valueFormatter={(v) => formatCurrency(v)} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Amount"
                  stroke={chart.colors.danger}
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
                <CartesianGrid {...chart.grid} />
                <XAxis dataKey="name" {...chart.axis} />
                <YAxis
                  {...chart.axis}
                  width={52}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip
                  cursor={false}
                  content={
                    <ChartTooltip valueFormatter={(v) => formatCurrency(v)} />
                  }
                />
                <Bar dataKey="value" name="Spend" fill={chart.colors.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      ) : null}
    </div>
  );
}
