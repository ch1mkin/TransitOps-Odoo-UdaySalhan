"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
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
import { useEntityTab } from "@/hooks/use-entity-tab";
import type { Driver, Trip, Vehicle } from "@/types/entities";

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
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
}

export function DashboardModule({
  vehicles,
  drivers,
  trips,
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

  const activeVehicles = vehicles.filter((v) => v.status !== "Retired").length;
  const driversOnTrip = drivers.filter((d) => d.status === "On Trip").length;
  const activeTrips = trips.filter((t) => t.status === "Dispatched").length;
  const utilization =
    vehicles.length === 0
      ? 0
      : Math.round(
          (vehicles.filter((v) => v.status === "On Trip").length /
            vehicles.filter((v) => v.status !== "Retired").length) *
            100
        );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fleet operations overview — live data from Supabase
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Vehicles", value: String(activeVehicles) },
          { label: "Drivers On Trip", value: String(driversOnTrip) },
          { label: "Active Trips", value: String(activeTrips) },
          { label: "Fleet Utilization", value: `${utilization}%` },
        ].map((kpi, index) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>
                {String(index + 1).padStart(2, "0")} · {kpi.label}
              </CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {kpi.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

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
    </div>
  );
}
