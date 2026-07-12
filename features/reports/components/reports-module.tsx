"use client";

import { useMemo, useState } from "react";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { FleetCharts } from "@/features/reports/components/fleet-charts";
import { withinDateRange } from "@/lib/utils/date-filter";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { exportFilter } from "@/lib/utils/export";
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
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredFuel = useMemo(
    () => fuelLogs.filter((row) => withinDateRange(row.date, dateFrom, dateTo)),
    [fuelLogs, dateFrom, dateTo]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((row) => withinDateRange(row.date, dateFrom, dateTo)),
    [expenses, dateFrom, dateTo]
  );

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const date = trip.dispatch_time?.slice(0, 10) ?? trip.completion_time?.slice(0, 10) ?? "";
        return withinDateRange(date, dateFrom, dateTo);
      }),
    [trips, dateFrom, dateTo]
  );

  const exportRows = useMemo(() => {
    const q = search.toLowerCase();

    if (variant === "safety") {
      return drivers
        .filter((driver) => {
          if (!q) return true;
          return (
            driver.name.toLowerCase().includes(q) ||
            driver.license_number.toLowerCase().includes(q)
          );
        })
        .map((d) => ({
          module: "Driver",
          reference: d.name,
          detail: d.license_number,
          status: d.status,
          metric: `${d.safety_score}%`,
        }));
    }

    if (variant === "financial") {
      return [
        ...filteredFuel.map((f) => ({
          module: "Fuel",
          reference: f.date,
          detail: `${formatNumber(f.liters)} L`,
          status: "Logged",
          metric: formatCurrency(f.cost),
        })),
        ...filteredExpenses.map((e) => ({
          module: "Expense",
          reference: e.category,
          detail: e.description,
          status: e.date,
          metric: formatCurrency(e.amount),
        })),
      ].filter((row) => {
        if (!q) return true;
        return (
          row.module.toLowerCase().includes(q) ||
          row.reference.toLowerCase().includes(q) ||
          row.detail.toLowerCase().includes(q)
        );
      });
    }

    return [
      ...vehicles.map((v) => ({
        module: "Vehicle",
        reference: v.registration_number,
        detail: v.vehicle_name,
        status: v.status,
        metric: `${formatNumber(v.odometer)} km`,
      })),
      ...filteredTrips.map((t) => ({
        module: "Trip",
        reference: t.trip_number,
        detail: `${t.source} → ${t.destination}`,
        status: t.status,
        metric: `${formatNumber(t.planned_distance)} km`,
      })),
    ].filter((row) => {
      if (!q) return true;
      return (
        row.module.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q) ||
        row.detail.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q)
      );
    });
  }, [
    variant,
    drivers,
    vehicles,
    filteredFuel,
    filteredExpenses,
    filteredTrips,
    search,
  ]);

  return (
    <div className="space-y-4">
      <ModulePage
        title={copy.title}
        description={copy.description}
        actions={
          <ExportButton
            title={copy.title}
            filename={`transitops-${variant}-reports`}
            rows={exportRows}
            sheetName="Reports"
            subtitle={copy.description}
            filters={[
              exportFilter("Search", search),
              exportFilter("From", dateFrom, "Any"),
              exportFilter("To", dateTo, "Any"),
              exportFilter("Report Type", copy.title),
            ]}
            columns={[
              { header: "Module", value: (r) => r.module },
              { header: "Reference", value: (r) => r.reference },
              { header: "Details", value: (r) => r.detail },
              { header: "Status", value: (r) => r.status },
              { header: "Metric", value: (r) => r.metric },
            ]}
          />
        }
        filters={
          <ModuleFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search report records…"
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        }
      >
        <div className="px-4 pb-2 text-sm text-muted-foreground">
          Live analytics from Supabase — export respects the filters above.
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
