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
import { DriverFormDialog } from "@/features/drivers/components/driver-form-dialog";
import { updateDriverStatus } from "@/lib/fleet/actions";
import { MANUAL_DRIVER_STATUSES } from "@/lib/fleet/status-rules";
import { useSettingsStore } from "@/store/settings-store";
import { useEntityTab } from "@/hooks/use-entity-tab";
import { cn } from "@/lib/utils";
import { exportFilter } from "@/lib/utils/export";
import type { Driver, DriverStatus } from "@/types/entities";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "Available" },
  { label: "On Trip", value: "On Trip" },
  { label: "Off Duty", value: "Off Duty" },
  { label: "Suspended", value: "Suspended" },
];

interface DriversModuleProps {
  drivers: Driver[];
  canCreate?: boolean;
  canChangeStatus?: boolean;
}

export function DriversModule({
  drivers,
  canCreate = false,
  canChangeStatus = false,
}: DriversModuleProps) {
  const highlightSuspended = useSettingsStore(
    (s) => s.byRole.safety_officer.highlightSuspendedDrivers
  );
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const columns: DataTableColumn<Driver>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Driver Name",
        sortValue: (row) => row.name,
        cell: (row) => (
          <span
            className={cn(
              "font-medium",
              highlightSuspended &&
                row.status === "Suspended" &&
                "text-destructive"
            )}
          >
            {row.name}
          </span>
        ),
      },
      { key: "license", header: "License No.", sortValue: (row) => row.license_number, cell: (row) => row.license_number },
      { key: "category", header: "Category", sortValue: (row) => row.license_category, cell: (row) => row.license_category },
      { key: "expiry", header: "License Expiry", sortValue: (row) => row.license_expiry, cell: (row) => row.license_expiry },
      { key: "phone", header: "Phone", sortValue: (row) => row.phone, cell: (row) => row.phone },
      {
        key: "safety",
        header: "Safety Score",
        className: "text-right",
        sortValue: (row) => row.safety_score,
        cell: (row) => `${row.safety_score}%`,
      },
      {
        key: "status",
        header: "Status",
        sortValue: (row) => row.status,
        cell: (row) =>
          canChangeStatus ? (
            <InlineStatusSelect
              value={row.status}
              options={MANUAL_DRIVER_STATUSES}
              disabled={row.status === "On Trip"}
              confirmChange={(next) =>
                next === "Suspended"
                  ? {
                      title: "Suspend driver?",
                      description:
                        "Suspended drivers cannot be assigned to trips until reinstated.",
                      destructive: true,
                    }
                  : null
              }
              onChange={async (status) => {
                const result = await updateDriverStatus(row.id, status as DriverStatus);
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
    [canChangeStatus, highlightSuspended]
  );

  const filtered = useMemo(() => {
    return drivers.filter((driver) => {
      const matchesSearch =
        search === "" ||
        driver.name.toLowerCase().includes(search.toLowerCase()) ||
        driver.license_number.toLowerCase().includes(search.toLowerCase()) ||
        driver.phone.includes(search);

      const matchesStatus =
        statusFilter === "all" || driver.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, search, statusFilter]);

  return (
    <>
      <ModulePage
        title="Driver Management"
        description="Manage driver profiles, safety scores, and operational status"
        actions={
        <div className="flex gap-2">
          <ExportButton
            title="Driver Management Report"
            filename="drivers"
            rows={filtered}
            sheetName="Drivers"
            filters={[
              exportFilter("Search", search),
              exportFilter("Status", statusFilter === "all" ? "All statuses" : statusFilter),
            ]}
            columns={[
              { header: "Name", value: (r) => r.name },
              { header: "License", value: (r) => r.license_number },
              { header: "Category", value: (r) => r.license_category },
              { header: "Expiry", value: (r) => r.license_expiry },
              { header: "Phone", value: (r) => r.phone },
              { header: "Email", value: (r) => r.email },
              { header: "Safety Score", value: (r) => r.safety_score },
              { header: "Status", value: (r) => r.status },
            ]}
          />
          {canCreate ? (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Add Driver
            </Button>
          ) : null}
        </div>
      }
        filters={
          <ModuleFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, license, phone…"
            filters={[
              {
                id: "driver-status",
                label: "Status",
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
          emptyMessage="No drivers match your filters."
          onRowClick={(row) =>
            openEntity(row.name, `/drivers/${row.id}`, "driver", row.id)
          }
          renderRowActions={(row) => (
            <RowActions
              onOpen={() =>
                openEntity(row.name, `/drivers/${row.id}`, "driver", row.id)
              }
              onPopout={() =>
                popoutEntity(row.name, `/drivers/${row.id}`, "driver", row.id)
              }
              popoutLabel={`Pop out ${row.name}`}
            />
          )}
        />
      </ModulePage>

      {canCreate && (
        <DriverFormDialog open={formOpen} onOpenChange={setFormOpen} />
      )}
    </>
  );
}
