"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { TripFormDialog } from "@/features/trips/components/trip-form-dialog";
import { useEntityTab } from "@/hooks/use-entity-tab";
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
}

export function TripsModule({
  trips,
  vehicles,
  drivers,
  vehicleLabels,
  driverLabels,
  canCreate = false,
}: TripsModuleProps) {
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

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
        statusFilter === "all" || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter, vehicleLabels, driverLabels]);

  return (
    <>
      <ModulePage
        title="Trips"
        description="Dispatch and track trips across your fleet"
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              New Trip
            </Button>
          ) : undefined
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
                options: STATUS_OPTIONS,
                value: statusFilter,
                onChange: setStatusFilter,
              },
            ]}
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
