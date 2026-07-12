"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { InlineStatusSelect } from "@/components/data/inline-status-select";
import { ExportButton } from "@/components/data/export-button";
import { VehicleFormDialog } from "@/features/vehicles/components/vehicle-form-dialog";
import { updateVehicleStatus } from "@/lib/fleet/actions";
import { MANUAL_VEHICLE_STATUSES } from "@/lib/fleet/status-rules";
import { formatNumber } from "@/lib/utils/format";
import { exportFilter } from "@/lib/utils/export";
import { useEntityTab } from "@/hooks/use-entity-tab";
import type { Vehicle, VehicleStatus } from "@/types/entities";

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

interface VehiclesModuleProps {
  vehicles: Vehicle[];
  canCreate?: boolean;
  canChangeStatus?: boolean;
}

export function VehiclesModule({
  vehicles,
  canCreate = false,
  canChangeStatus = false,
}: VehiclesModuleProps) {
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const columns: DataTableColumn<Vehicle>[] = useMemo(
    () => [
      {
        key: "registration",
        header: "Registration",
        sortValue: (row) => row.registration_number,
        cell: (row) => (
          <span className="font-medium">{row.registration_number}</span>
        ),
      },
      {
        key: "name",
        header: "Vehicle Name",
        sortValue: (row) => row.vehicle_name,
        cell: (row) => row.vehicle_name,
      },
      {
        key: "model",
        header: "Model",
        sortValue: (row) => row.vehicle_model,
        cell: (row) => row.vehicle_model,
      },
      {
        key: "type",
        header: "Type",
        sortValue: (row) => row.vehicle_type,
        cell: (row) => row.vehicle_type,
      },
      {
        key: "capacity",
        header: "Capacity (kg)",
        className: "text-right",
        sortValue: (row) => row.max_load_capacity,
        cell: (row) => formatNumber(row.max_load_capacity),
      },
      {
        key: "odometer",
        header: "Odometer",
        className: "text-right",
        sortValue: (row) => row.odometer,
        cell: (row) => `${formatNumber(row.odometer)} km`,
      },
      {
        key: "status",
        header: "Status",
        sortValue: (row) => row.status,
        cell: (row) =>
          canChangeStatus ? (
            <InlineStatusSelect
              value={row.status}
              options={MANUAL_VEHICLE_STATUSES}
              disabled={row.status === "On Trip"}
              confirmChange={(next) =>
                next === "Retired"
                  ? {
                      title: "Retire vehicle?",
                      description:
                        "This vehicle will be removed from dispatch and marked as retired.",
                      destructive: true,
                    }
                  : null
              }
              onChange={async (status) => {
                const result = await updateVehicleStatus(row.id, status as VehicleStatus);
                return result.success
                  ? { success: true }
                  : { success: false, error: result.error };
              }}
            />
          ) : (
            <StatusBadge status={row.status} />
          ),
      },
    ],
    [canChangeStatus]
  );

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
        title="Vehicle Registry"
        description="Fleet registry — update status, edit, or retire vehicles"
        actions={
        <div className="flex gap-2">
          <ExportButton
            title="Vehicle Registry Report"
            filename="vehicles"
            rows={filtered}
            sheetName="Vehicles"
            filters={[
              exportFilter("Search", search),
              exportFilter("Status", statusFilter === "all" ? "All statuses" : statusFilter),
              exportFilter("Type", typeFilter === "all" ? "All types" : typeFilter),
            ]}
            columns={[
              { header: "Registration", value: (r) => r.registration_number },
              { header: "Name", value: (r) => r.vehicle_name },
              { header: "Model", value: (r) => r.vehicle_model },
              { header: "Type", value: (r) => r.vehicle_type },
              { header: "Capacity (kg)", value: (r) => r.max_load_capacity },
              { header: "Odometer", value: (r) => r.odometer },
              { header: "Status", value: (r) => r.status },
            ]}
          />
          {canCreate ? (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Add Vehicle
            </Button>
          ) : null}
        </div>
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
