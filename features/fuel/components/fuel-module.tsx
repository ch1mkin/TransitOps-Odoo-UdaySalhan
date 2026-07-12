"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { Button } from "@/components/ui/button";
import { FuelFormDialog } from "@/features/fuel/components/fuel-form-dialog";
import type { FuelLog, Vehicle } from "@/types/entities";

interface FuelModuleProps {
  records: FuelLog[];
  vehicles: Vehicle[];
  vehicleLabels: Record<string, string>;
  canManage?: boolean;
}

export function FuelModule({
  records,
  vehicles,
  vehicleLabels,
  canManage = false,
}: FuelModuleProps) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const columns: DataTableColumn<FuelLog>[] = useMemo(
    () => [
      {
        key: "vehicle",
        header: "Vehicle",
        cell: (r) => (
          <span className="font-medium">{vehicleLabels[r.vehicle_id] ?? "—"}</span>
        ),
      },
      {
        key: "liters",
        header: "Liters",
        className: "text-right",
        cell: (r) => r.liters.toLocaleString(),
      },
      {
        key: "cost",
        header: "Cost (₹)",
        className: "text-right",
        cell: (r) => r.cost.toLocaleString(),
      },
      {
        key: "odometer",
        header: "Odometer",
        className: "text-right",
        cell: (r) => `${r.odometer.toLocaleString()} km`,
      },
      { key: "date", header: "Date", cell: (r) => r.date },
    ],
    [vehicleLabels]
  );

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter((row) => {
      const vehicle = (vehicleLabels[row.vehicle_id] ?? "").toLowerCase();
      return vehicle.includes(q) || row.date.includes(q);
    });
  }, [records, search, vehicleLabels]);

  return (
    <>
      <ModulePage
        title="Fuel Logs"
        description="Fuel consumption and cost tracking"
        actions={
          <div className="flex gap-2">
            <ExportButton
              filename="fuel-logs"
              rows={filtered}
              sheetName="Fuel"
              columns={[
                { header: "Vehicle", value: (r) => vehicleLabels[r.vehicle_id] ?? "" },
                { header: "Liters", value: (r) => r.liters },
                { header: "Cost", value: (r) => r.cost },
                { header: "Odometer", value: (r) => r.odometer },
                { header: "Date", value: (r) => r.date },
              ]}
            />
            {canManage ? (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                Record Fuel
              </Button>
            ) : null}
          </div>
        }
      filters={
        <ModuleFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vehicle or date…"
        />
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        emptyMessage="No fuel logs found."
      />
    </ModulePage>

      {canManage ? (
        <FuelFormDialog open={formOpen} onOpenChange={setFormOpen} vehicles={vehicles} />
      ) : null}
    </>
  );
}
