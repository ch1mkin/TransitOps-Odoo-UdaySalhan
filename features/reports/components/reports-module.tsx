"use client";

import { ExportButton } from "@/components/data/export-button";
import { ModulePage } from "@/components/data/module-page";
import { FleetCharts } from "@/features/reports/components/fleet-charts";
import type { Driver, ExpenseLog, FuelLog, MaintenanceLog, Trip, Vehicle } from "@/types/entities";

interface ReportsModuleProps {
  variant: "fleet" | "safety" | "financial";
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: ExpenseLog[];
  maintenanceLogs: MaintenanceLog[];
}

const COPY = {
  fleet: {
    title: "Fleet Analytics",
    description: "Fleet utilization, maintenance trends, and vehicle status",
  },
  safety: {
    title: "Safety Reports",
    description: "License expiry, safety scores, and driver compliance",
  },
  financial: {
    title: "Financial Reports",
    description: "Fuel trends, expenses, and operational cost analysis",
  },
};

export function ReportsModule({
  variant,
  vehicles,
  drivers,
  trips,
  fuelLogs,
  expenses,
  maintenanceLogs,
}: ReportsModuleProps) {
  const copy = COPY[variant];
  const exportRows =
    variant === "safety"
      ? drivers.map((d) => ({
          module: "Driver",
          reference: d.name,
          detail: d.license_number,
          status: d.status,
          metric: d.safety_score,
        }))
      : variant === "financial"
        ? [
            ...fuelLogs.map((f) => ({
              module: "Fuel",
              reference: f.date,
              detail: `${f.liters} L`,
              status: "Logged",
              metric: f.cost,
            })),
            ...expenses.map((e) => ({
              module: "Expense",
              reference: e.category,
              detail: e.description,
              status: e.date,
              metric: e.amount,
            })),
          ]
        : [
            ...vehicles.map((v) => ({
              module: "Vehicle",
              reference: v.registration_number,
              detail: v.vehicle_name,
              status: v.status,
              metric: v.odometer,
            })),
            ...trips.map((t) => ({
              module: "Trip",
              reference: t.trip_number,
              detail: `${t.source} → ${t.destination}`,
              status: t.status,
              metric: t.planned_distance,
            })),
          ];

  return (
    <div className="space-y-4">
      <ModulePage
        title={copy.title}
        description={copy.description}
        actions={
          <ExportButton
            filename="transitops-reports"
            rows={exportRows}
            sheetName="Reports"
            columns={[
              { header: "Module", value: (r) => r.module },
              { header: "Reference", value: (r) => r.reference },
              { header: "Details", value: (r) => r.detail },
              { header: "Status", value: (r) => r.status },
              { header: "Metric", value: (r) => r.metric },
            ]}
          />
        }
      >
        <div className="px-4 pb-2 text-sm text-muted-foreground">
          Live analytics from Supabase — export available above.
        </div>
      </ModulePage>

      <FleetCharts
        variant={variant}
        vehicles={vehicles}
        drivers={drivers}
        trips={trips}
        fuelLogs={fuelLogs}
        expenses={expenses}
        maintenanceLogs={maintenanceLogs}
      />
    </div>
  );
}
