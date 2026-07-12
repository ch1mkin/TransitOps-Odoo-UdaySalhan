"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { formatCurrency } from "@/components/charts/chart-theme";
import { useChartTheme } from "@/components/charts/use-chart-theme";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { ExportButton } from "@/components/data/export-button";
import { ModulePage } from "@/components/data/module-page";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLES } from "@/constants/roles";
import { useSettingsStore } from "@/store/settings-store";
import { exportFilter } from "@/lib/utils/export";
import type { ExpenseLog, FuelLog, Trip, Vehicle } from "@/types/entities";

interface RoiAnalyticsModuleProps {
  vehicles: Vehicle[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: ExpenseLog[];
}

export function RoiAnalyticsModule({
  vehicles,
  trips,
  fuelLogs,
  expenses,
}: RoiAnalyticsModuleProps) {
  const chart = useChartTheme();
  const amortizationPercent = useSettingsStore(
    (s) => s.byRole[ROLES.FINANCIAL_ANALYST].roiAmortizationPercent
  );

  const rows = useMemo(() => {
    return vehicles
      .filter((v) => v.status !== "Retired")
      .map((vehicle) => {
        const vehicleTrips = trips.filter(
          (t) => t.vehicle_id === vehicle.id && t.status === "Completed"
        );
        const revenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue ?? 0), 0);
        const fuelCost = fuelLogs
          .filter((f) => f.vehicle_id === vehicle.id)
          .reduce((sum, f) => sum + f.cost, 0);
        const expenseCost = expenses
          .filter((e) => e.vehicle_id === vehicle.id)
          .reduce((sum, e) => sum + e.amount, 0);
        const totalCost = fuelCost + expenseCost;
        const amortization =
          vehicle.acquisition_cost * (amortizationPercent / 100);
        const profit = revenue - totalCost - amortization;
        const roi =
          vehicle.acquisition_cost > 0
            ? Math.round((profit / vehicle.acquisition_cost) * 100)
            : 0;

        return {
          id: vehicle.id,
          vehicle: vehicle.registration_number,
          revenue,
          cost: totalCost,
          profit,
          roi,
          trips: vehicleTrips.length,
        };
      })
      .sort((a, b) => b.roi - a.roi);
  }, [vehicles, trips, fuelLogs, expenses, amortizationPercent]);

  const chartData = rows.slice(0, 8).map((r) => ({
    name: r.vehicle,
    roi: r.roi,
    profit: r.profit,
  }));

  const avgRoi =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((sum, r) => sum + r.roi, 0) / rows.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average ROI</CardDescription>
            <CardTitle className="text-2xl">{avgRoi}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tracked Vehicles</CardDescription>
            <CardTitle className="text-2xl">{rows.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Performer</CardDescription>
            <CardTitle className="text-2xl">{rows[0]?.vehicle ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <ModulePage
        title="ROI Analytics"
        description="Vehicle profitability from trips, fuel, and expenses vs acquisition cost"
        actions={
          <ExportButton
            title="ROI Analytics Report"
            filename="roi-analytics"
            rows={rows}
            sheetName="ROI"
            subtitle={`Amortization: ${amortizationPercent}% of acquisition cost`}
            filters={[
              exportFilter("Scope", "Active fleet vehicles"),
              exportFilter("Amortization", `${amortizationPercent}%`),
            ]}
            columns={[
              { header: "Vehicle", value: (r) => r.vehicle },
              { header: "Revenue", value: (r) => formatCurrency(r.revenue) },
              { header: "Operating Cost", value: (r) => formatCurrency(r.cost) },
              { header: "Profit", value: (r) => formatCurrency(r.profit) },
              { header: "ROI %", value: (r) => r.roi },
              { header: "Completed Trips", value: (r) => r.trips },
            ]}
          />
        }
      >
        <div />
      </ModulePage>

      <ChartCard
        title="ROI by vehicle"
        description="Return on investment across active fleet"
        empty={chartData.length === 0}
        footer="Based on completed trip revenue, fuel, expenses, and amortized acquisition cost"
      >
        <ResponsiveContainer key={chart.id} width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...chart.grid} />
            <XAxis dataKey="name" {...chart.axis} />
            <YAxis {...chart.axis} width={40} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              cursor={false}
              content={
                <ChartTooltip
                  valueFormatter={(v, key) =>
                    key === "profit" ? formatCurrency(v) : `${v}%`
                  }
                />
              }
            />
            <Bar
              dataKey="roi"
              name="ROI %"
              fill={chart.colors.accent}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
