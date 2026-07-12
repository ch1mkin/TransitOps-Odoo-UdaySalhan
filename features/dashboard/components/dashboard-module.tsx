"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FleetCharts } from "@/features/reports/components/fleet-charts";
import { ROLES, type Role } from "@/constants/roles";
import { computeAverageFuelEfficiency } from "@/lib/fleet/metrics";
import { isLicenseExpired } from "@/lib/fleet/trip-lifecycle";
import { useEntityTab } from "@/hooks/use-entity-tab";
import type { Driver, ExpenseLog, FuelLog, MaintenanceLog, Trip, Vehicle } from "@/types/entities";

interface ActivityRow {
  id: string;
  module: string;
  reference: string;
  detail: string;
  status: string;
  href: string;
  entityType: string;
  entityId: string;
  tabTitle: string;
}

const columns: DataTableColumn<ActivityRow>[] = [
  { key: "module", header: "Module", cell: (row) => row.module },
  {
    key: "reference",
    header: "Reference",
    cell: (row) => <span className="font-medium">{row.reference}</span>,
  },
  { key: "detail", header: "Details", cell: (row) => row.detail },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

interface DashboardModuleProps {
  role: Role;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  fuelLogs: FuelLog[];
  expenses: ExpenseLog[];
  maintenanceLogs: MaintenanceLog[];
}

export function DashboardModule({
  role,
  vehicles,
  drivers,
  trips,
  fuelLogs,
  expenses,
  maintenanceLogs,
}: DashboardModuleProps) {
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");

  const activity = useMemo<ActivityRow[]>(() => {
    const tripRows = trips.slice(0, 6).map((trip) => ({
      id: `trip-${trip.id}`,
      module: "Trips",
      reference: trip.trip_number,
      detail: `${trip.source} → ${trip.destination}`,
      status: trip.status,
      href: `/trips/${trip.id}`,
      entityType: "trip",
      entityId: trip.id,
      tabTitle: trip.trip_number,
    }));

    const vehicleRows = vehicles.slice(0, 4).map((vehicle) => ({
      id: `vehicle-${vehicle.id}`,
      module: "Vehicles",
      reference: vehicle.registration_number,
      detail: `${vehicle.vehicle_name} · ${vehicle.vehicle_model}`,
      status: vehicle.status,
      href: `/vehicles/${vehicle.id}`,
      entityType: "vehicle",
      entityId: vehicle.id,
      tabTitle: vehicle.registration_number,
    }));

    return [...tripRows, ...vehicleRows];
  }, [trips, vehicles]);

  const filtered = useMemo(() => {
    if (!search) return activity;
    const q = search.toLowerCase();
    return activity.filter(
      (row) =>
        row.module.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q) ||
        row.detail.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q)
    );
  }, [activity, search]);

  const kpis = useMemo(() => {
    if (role === ROLES.DISPATCHER) {
      const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
      const eligibleDrivers = drivers.filter(
        (d) => d.status === "Available" && !isLicenseExpired(d.license_expiry)
      ).length;
      const pendingTrips = trips.filter((t) => t.status === "Draft").length;
      const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
      const completedTrips = trips.filter((t) => t.status === "Completed").length;
      const cancelledTrips = trips.filter((t) => t.status === "Cancelled").length;

      return [
        { label: "Available Vehicles", value: String(availableVehicles) },
        { label: "Eligible Drivers", value: String(eligibleDrivers) },
        { label: "Draft Trips", value: String(pendingTrips) },
        { label: "Active Trips", value: String(activeTrips) },
        { label: "Completed Trips", value: String(completedTrips) },
        { label: "Cancelled Trips", value: String(cancelledTrips) },
      ];
    }

    if (role === ROLES.SAFETY_OFFICER) {
      const expired = drivers.filter((d) => isLicenseExpired(d.license_expiry)).length;
      const expiringSoon = drivers.filter(
        (d) => !isLicenseExpired(d.license_expiry) &&
          new Date(d.license_expiry).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
      ).length;
      const suspended = drivers.filter((d) => d.status === "Suspended").length;
      const avgSafety =
        drivers.length === 0
          ? 0
          : Math.round(
              drivers.reduce((sum, d) => sum + d.safety_score, 0) / drivers.length
            );

      return [
        { label: "Total Drivers", value: String(drivers.length) },
        { label: "Expired Licenses", value: String(expired) },
        { label: "Expiring Soon", value: String(expiringSoon) },
        { label: "Suspended", value: String(suspended) },
        { label: "Avg Safety Score", value: `${avgSafety}%` },
        { label: "On Trip", value: String(drivers.filter((d) => d.status === "On Trip").length) },
      ];
    }

    if (role === ROLES.FINANCIAL_ANALYST) {
      const fuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const expenseTotal = expenses.reduce((sum, log) => sum + log.amount, 0);
      const maintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
      const fuelEfficiency = computeAverageFuelEfficiency(trips, fuelLogs);
      const completedTrips = trips.filter((t) => t.status === "Completed").length;
      const revenue = trips
        .filter((t) => t.status === "Completed")
        .reduce((sum, t) => sum + (t.revenue ?? 0), 0);

      return [
        { label: "Fuel Cost", value: `₹${fuelCost.toLocaleString()}` },
        { label: "Total Expenses", value: `₹${expenseTotal.toLocaleString()}` },
        { label: "Maintenance Cost", value: `₹${maintenanceCost.toLocaleString()}` },
        { label: "Avg Fuel Efficiency", value: `${fuelEfficiency} km/L` },
        {
          label: "Operational Cost",
          value: `₹${(fuelCost + expenseTotal + maintenanceCost).toLocaleString()}`,
        },
        { label: "Completed Trips", value: String(completedTrips) },
        { label: "Trip Revenue", value: `₹${revenue.toLocaleString()}` },
      ];
    }

    const activeVehicles = vehicles.filter((v) => v.status !== "Retired").length;
    const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
    const inShop = vehicles.filter((v) => v.status === "In Shop").length;
    const retiredVehicles = vehicles.filter((v) => v.status === "Retired").length;
    const onTripVehicles = vehicles.filter((v) => v.status === "On Trip").length;
    const driversOnTrip = drivers.filter((d) => d.status === "On Trip").length;
    const driversOnDuty = drivers.filter((d) => d.status === "Available").length;
    const pendingTrips = trips.filter((t) => t.status === "Draft").length;
    const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
    const completedTrips = trips.filter((t) => t.status === "Completed").length;
    const utilization =
      activeVehicles === 0 ? 0 : Math.round((onTripVehicles / activeVehicles) * 100);
    const fuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const expenseTotal = expenses.reduce((sum, log) => sum + log.amount, 0);
    const maintenanceCost = maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
    const fuelEfficiency = computeAverageFuelEfficiency(trips, fuelLogs);

    return [
      { label: "Active Vehicles", value: String(activeVehicles) },
      { label: "Available Vehicles", value: String(availableVehicles) },
      { label: "Vehicles In Shop", value: String(inShop) },
      { label: "Retired Vehicles", value: String(retiredVehicles) },
      { label: "Drivers On Duty", value: String(driversOnDuty) },
      { label: "Drivers On Trip", value: String(driversOnTrip) },
      { label: "Pending Trips", value: String(pendingTrips) },
      { label: "Active Trips", value: String(activeTrips) },
      { label: "Completed Trips", value: String(completedTrips) },
      { label: "Fleet Utilization", value: `${utilization}%` },
      { label: "Avg Fuel Efficiency", value: `${fuelEfficiency} km/L` },
      { label: "Maintenance Cost", value: `₹${maintenanceCost.toLocaleString()}` },
      { label: "Operational Cost", value: `₹${(fuelCost + expenseTotal + maintenanceCost).toLocaleString()}` },
    ];
  }, [vehicles, drivers, trips, fuelLogs, expenses, maintenanceLogs, role]);

  const dashboardCopy = {
    [ROLES.FLEET_MANAGER]: {
      title: "Fleet Dashboard",
      description: "Fleet KPIs, utilization, and recent activity",
    },
    [ROLES.DISPATCHER]: {
      title: "Dispatch Dashboard",
      description: "Trip planning capacity and dispatch overview",
    },
    [ROLES.SAFETY_OFFICER]: {
      title: "Safety Dashboard",
      description: "Driver compliance, licenses, and safety scores",
    },
    [ROLES.FINANCIAL_ANALYST]: {
      title: "Financial Dashboard",
      description: "Operational costs, fuel, and expense overview",
    },
  }[role];

  const chartVariant =
    role === ROLES.FLEET_MANAGER
      ? "fleet"
      : role === ROLES.SAFETY_OFFICER
        ? "safety"
        : role === ROLES.FINANCIAL_ANALYST
          ? "financial"
          : "all";

  const showCharts =
    role === ROLES.FLEET_MANAGER ||
    role === ROLES.SAFETY_OFFICER ||
    role === ROLES.FINANCIAL_ANALYST;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{dashboardCopy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dashboardCopy.description}</p>
        </div>
        <ExportButton
          filename="dashboard-activity"
          rows={filtered}
          sheetName="Activity"
          columns={[
            { header: "Module", value: (r) => r.module },
            { header: "Reference", value: (r) => r.reference },
            { header: "Details", value: (r) => r.detail },
            { header: "Status", value: (r) => r.status },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>
                {String(index + 1).padStart(2, "0")} · {kpi.label}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {showCharts ? (
        <FleetCharts
          variant={chartVariant}
          vehicles={vehicles}
          drivers={drivers}
          trips={trips}
          fuelLogs={fuelLogs}
          expenses={expenses}
          maintenanceLogs={maintenanceLogs}
        />
      ) : null}

      {role === ROLES.FLEET_MANAGER || role === ROLES.DISPATCHER ? (
        <ModulePage
          title="Recent Activity"
          description="Click a row to open the record in a workspace tab"
          filters={
            <ModuleFilters
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search activity…"
            />
          }
        >
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(row) => row.id}
            emptyMessage="No activity matches your search."
            onRowClick={(row) =>
              openEntity(row.tabTitle, row.href, row.entityType, row.entityId)
            }
            renderRowActions={(row) => (
              <RowActions
                onOpen={() =>
                  openEntity(row.tabTitle, row.href, row.entityType, row.entityId)
                }
                onPopout={() =>
                  popoutEntity(
                    row.tabTitle,
                    row.href,
                    row.entityType,
                    row.entityId
                  )
                }
                popoutLabel={`Pop out ${row.reference}`}
              />
            )}
          />
        </ModulePage>
      ) : null}
    </div>
  );
}
