"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { RowActions } from "@/components/data/row-actions";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { DriverFormDialog } from "@/features/drivers/components/driver-form-dialog";
import { useEntityTab } from "@/hooks/use-entity-tab";
import type { Driver } from "@/types/entities";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "Available" },
  { label: "On Trip", value: "On Trip" },
  { label: "Off Duty", value: "Off Duty" },
  { label: "Suspended", value: "Suspended" },
];

const columns: DataTableColumn<Driver>[] = [
  {
    key: "name",
    header: "Driver Name",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "license", header: "License No.", cell: (row) => row.license_number },
  { key: "category", header: "Category", cell: (row) => row.license_category },
  { key: "expiry", header: "License Expiry", cell: (row) => row.license_expiry },
  { key: "phone", header: "Phone", cell: (row) => row.phone },
  {
    key: "safety",
    header: "Safety Score",
    className: "text-right",
    cell: (row) => `${row.safety_score}%`,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

interface DriversModuleProps {
  drivers: Driver[];
  canCreate?: boolean;
}

export function DriversModule({ drivers, canCreate = false }: DriversModuleProps) {
  const { openEntity, popoutEntity } = useEntityTab();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

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
        title="Drivers"
        description="Driver roster and license monitoring"
        actions={
          canCreate ? (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              Add Driver
            </Button>
          ) : undefined
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
