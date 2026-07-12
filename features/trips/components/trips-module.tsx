"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/data/export-button";
import { TripFormDialog } from "@/features/trips/components/trip-form-dialog";
import { useEntityTab } from "@/hooks/use-entity-tab";
import { getTripFilterDate, withinDateRange } from "@/lib/utils/date-filter";
import type { Driver, Trip, Vehicle } from "@/types/entities";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "Draft" },
  { label: "Dispatched", value: "Dispatched" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

interface TripsModuleProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  vehicleLabels: Record<string, string>;
  driverLabels: Record<string, string>;
  canCreate?: boolean;
  view?: "create" | "active" | "history" | "all";
}

export function TripsModule({
  trips,
  vehicles,
  drivers,
  vehicleLabels,
  driverLabels,
  canCreate = false,
  view = "all",
}: TripsModuleProps) {
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    view === "active" ? "Dispatched" : view === "history" ? "history" : "all"
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const viewMeta = {
    create: {
      title: "Create Trip",
      description: "Plan a new trip and assign an available vehicle and eligible driver",
    },
    active: {
      title: "Active Trips",
      description: "Dispatched trips currently in progress",
    },
    history: {
      title: "Trip History",
      description: "Completed and cancelled trips",
    },
    all: {
      title: "Trips",
      description: "Dispatch and track trips across your fleet",
    },
  }[view];

  const columns: DataTableColumn<Trip>[] = useMemo(
    () => [
      {
        key: "trip_number",
        header: "Trip No.",
        cell: (row) => <span className="font-medium">{row.trip_number}</span>,
      },
      { key: "source", header: "Source", cell: (row) => row.source },
      {
        key: "destination",
        header: "Destination",
        cell: (row) => row.destination,
      },
      {
        key: "vehicle",
        header: "Vehicle",
        cell: (row) => vehicleLabels[row.vehicle_id] ?? "—",
      },
      {
        key: "driver",
        header: "Driver",
        cell: (row) => driverLabels[row.driver_id] ?? "—",
      },
      {
        key: "cargo",
        header: "Cargo (kg)",
        className: "text-right",
        cell: (row) => row.cargo_weight.toLocaleString(),
      },
      {
        key: "distance",
        header: "Distance (km)",
        className: "text-right",
        cell: (row) => row.planned_distance.toLocaleString(),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
    ],
    [vehicleLabels, driverLabels]
  );

  const filtered = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        search === "" ||
        trip.trip_number.toLowerCase().includes(search.toLowerCase()) ||
        trip.source.toLowerCase().includes(search.toLowerCase()) ||
        trip.destination.toLowerCase().includes(search.toLowerCase()) ||
        (vehicleLabels[trip.vehicle_id] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (driverLabels[trip.driver_id] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? view === "create"
            ? trip.status === "Draft" || trip.status === "Dispatched"
            : true
          : statusFilter === "history"
            ? trip.status === "Completed" || trip.status === "Cancelled"
            : trip.status === statusFilter;

      return matchesSearch && matchesStatus && withinDateRange(getTripFilterDate(trip), dateFrom, dateTo);
    });
  }, [trips, search, statusFilter, dateFrom, dateTo, vehicleLabels, driverLabels, view]);

  const statusOptions =
    view === "history"
      ? [{ label: "History", value: "history" }]
      : view === "active"
        ? [{ label: "Dispatched", value: "Dispatched" }]
        : STATUS_OPTIONS;

  return (
    <>
      <ModulePage
        title={viewMeta.title}
        description={viewMeta.description}
        actions={
          <div className="flex gap-2">
            <ExportButton
              filename="trips"
              rows={filtered}
              sheetName="Trips"
              columns={[
                { header: "Trip No.", value: (r) => r.trip_number },
                { header: "Source", value: (r) => r.source },
                { header: "Destination", value: (r) => r.destination },
                { header: "Vehicle", value: (r) => vehicleLabels[r.vehicle_id] ?? "" },
                { header: "Driver", value: (r) => driverLabels[r.driver_id] ?? "" },
                { header: "Cargo (kg)", value: (r) => r.cargo_weight },
                { header: "Distance (km)", value: (r) => r.planned_distance },
                { header: "Status", value: (r) => r.status },
              ]}
            />
            {canCreate ? (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                New Trip
              </Button>
            ) : null}
          </div>
        }
        filters={
          <ModuleFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search trip, route, vehicle, driver…"
            filters={[
              {
                id: "trip-status",
                label: "Trip Status",
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter,
              },
            ]}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
        }
      >
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(row) => row.id}
          emptyMessage="No trips match your filters."
          onRowClick={(row) =>
            openEntity(row.trip_number, `/trips/${row.id}`, "trip", row.id)
          }
          renderRowActions={(row) => (
            <RowActions
              onOpen={() =>
                openEntity(row.trip_number, `/trips/${row.id}`, "trip", row.id)
              }
              onPopout={() =>
                popoutEntity(row.trip_number, `/trips/${row.id}`, "trip", row.id)
              }
              popoutLabel={`Pop out ${row.trip_number}`}
            />
          )}
        />
      </ModulePage>

      {canCreate && (
        <TripFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          vehicles={vehicles}
          drivers={drivers}
        />
      )}
    </>
  );
}
