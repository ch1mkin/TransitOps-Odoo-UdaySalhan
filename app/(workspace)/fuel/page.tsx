"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { MOCK_FUEL, getVehicleLabel } from "@/lib/mock-data";

const columns: DataTableColumn<(typeof MOCK_FUEL)[0]>[] = [
  {
    key: "vehicle",
    header: "Vehicle",
    cell: (r) => (
      <span className="font-medium">{getVehicleLabel(r.vehicle_id)}</span>
    ),
  },
  {
    key: "liters",
    header: "Liters",
    className: "text-right",
    cell: (r) => r.liters,
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
];

export default function FuelPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return MOCK_FUEL;
    const q = search.toLowerCase();
    return MOCK_FUEL.filter(
      (r) =>
        getVehicleLabel(r.vehicle_id).toLowerCase().includes(q) ||
        r.date.includes(q)
    );
  }, [search]);

  return (
    <ModulePage
      title="Fuel Logs"
      description="Track fuel consumption and costs"
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
  );
}
