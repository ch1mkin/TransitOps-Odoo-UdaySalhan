"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { VehicleFormDialog } from "@/features/vehicles/components/vehicle-form-dialog";
import { useEntityTab } from "@/hooks/use-entity-tab";
import type { Vehicle } from "@/types/entities";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "Available" },
  { label: "On Trip", value: "On Trip" },
  { label: "In Shop", value: "In Shop" },
  { label: "Retired", value: "Retired" },
];

const TYPE_OPTIONS = [
  { label: "All types", value: "all" },
  { label: "Heavy Truck", value: "Heavy Truck" },
  { label: "Medium Truck", value: "Medium Truck" },
  { label: "Light Truck", value: "Light Truck" },
];

const columns: DataTableColumn<Vehicle>[] = [
  {
    key: "registration",
    header: "Registration",
    cell: (row) => (
      <span className="font-medium">{row.registration_number}</span>
    ),
  },
  {
    key: "name",
    header: "Vehicle Name",
    cell: (row) => row.vehicle_name,
  },
  {
    key: "model",
    header: "Model",
    cell: (row) => row.vehicle_model,
  },
  {
    key: "type",
    header: "Type",
    cell: (row) => row.vehicle_type,
  },
  {
    key: "capacity",
    header: "Capacity (kg)",
    className: "text-right",
    cell: (row) => row.max_load_capacity.toLocaleString(),
  },
  {
    key: "odometer",
    header: "Odometer",
    className: "text-right",
    cell: (row) => `${row.odometer.toLocaleString()} km`,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

interface VehiclesModuleProps {
  vehicles: Vehicle[];
  canCreate?: boolean;
}

export function VehiclesModule({ vehicles, canCreate = false }: VehiclesModuleProps) {
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        search === "" ||
        vehicle.registration_number.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.vehicle_name.toLowerCase().includes(search.toLowerCase()) ||
        vehicle.vehicle_model.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || vehicle.status === statusFilter;

      const matchesType =
        typeFilter === "all" || vehicle.vehicle_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [vehicles, search, statusFilter, typeFilter]);

  return (
    <>
      <ModulePage
        title="Vehicles"
        description="Fleet registry — live data from Supabase"
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Add Vehicle
            </Button>
          ) : undefined
        }
        filters={
          <ModuleFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search registration, name, model…"
            filters={[
              {
                id: "vehicle-status",
                label: "Status",
                options: STATUS_OPTIONS,
                value: statusFilter,
                onChange: setStatusFilter,
              },
              {
                id: "vehicle-type",
                label: "Vehicle Type",
                options: TYPE_OPTIONS,
                value: typeFilter,
                onChange: setTypeFilter,
              },
            ]}
          />
        }
      >
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(row) => row.id}
          emptyMessage="No vehicles match your filters."
          onRowClick={(row) =>
            openEntity(
              row.registration_number,
              `/vehicles/${row.id}`,
              "vehicle",
              row.id
            )
          }
          renderRowActions={(row) => (
            <RowActions
              onOpen={() =>
                openEntity(
                  row.registration_number,
                  `/vehicles/${row.id}`,
                  "vehicle",
                  row.id
                )
              }
              onPopout={() =>
                popoutEntity(
                  row.registration_number,
                  `/vehicles/${row.id}`,
                  "vehicle",
                  row.id
                )
              }
              popoutLabel={`Pop out ${row.registration_number}`}
            />
          )}
        />
      </ModulePage>

      {canCreate && (
        <VehicleFormDialog open={formOpen} onOpenChange={setFormOpen} />
      )}
    </>
  );
}
