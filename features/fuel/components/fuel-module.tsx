"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { Button } from "@/components/ui/button";
import { FuelFormDialog } from "@/features/fuel/components/fuel-form-dialog";
import { withinDateRange } from "@/lib/utils/date-filter";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { exportFilter } from "@/lib/utils/export";
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
        cell: (r) => formatNumber(r.liters),
      },
      {
        key: "cost",
        header: "Cost (₹)",
        className: "text-right",
        cell: (r) => formatCurrency(r.cost),
      },
      {
        key: "odometer",
        header: "Odometer",
        className: "text-right",
        cell: (r) => `${formatNumber(r.odometer)} km`,
      },
      { key: "date", header: "Date", cell: (r) => r.date },
    ],
    [vehicleLabels]
  );

  const filtered = useMemo(() => {
    return records.filter((row) => {
      const q = search.toLowerCase();
      const vehicle = (vehicleLabels[row.vehicle_id] ?? "").toLowerCase();
      const matchesSearch =
        !q || vehicle.includes(q) || row.date.includes(q);
      return matchesSearch && withinDateRange(row.date, dateFrom, dateTo);
    });
  }, [records, search, dateFrom, dateTo, vehicleLabels]);

  return (
    <>
      <ModulePage
        title="Fuel Logs"
        description="Fuel consumption and cost tracking"
        actions={
          <div className="flex gap-2">
            <ExportButton
              title="Fuel Logs Report"
              filename="fuel-logs"
              rows={filtered}
              sheetName="Fuel"
              filters={[
                exportFilter("Search", search),
                exportFilter("From", dateFrom, "Any"),
                exportFilter("To", dateTo, "Any"),
              ]}
              columns={[
                { header: "Vehicle", value: (r) => vehicleLabels[r.vehicle_id] ?? "" },
                { header: "Liters", value: (r) => formatNumber(r.liters) },
                { header: "Cost", value: (r) => formatCurrency(r.cost) },
                { header: "Odometer", value: (r) => formatNumber(r.odometer) },
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
