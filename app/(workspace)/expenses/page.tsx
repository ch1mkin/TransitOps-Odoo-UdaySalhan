"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { MOCK_EXPENSES, getVehicleLabel } from "@/lib/mock-data";

const columns: DataTableColumn<(typeof MOCK_EXPENSES)[0]>[] = [
  {
    key: "category",
    header: "Category",
    cell: (r) => <span className="font-medium">{r.category}</span>,
  },
  {
    key: "vehicle",
    header: "Vehicle",
    cell: (r) => getVehicleLabel(r.vehicle_id),
  },
  {
    key: "amount",
    header: "Amount (₹)",
    className: "text-right",
    cell: (r) => r.amount.toLocaleString(),
  },
  { key: "description", header: "Description", cell: (r) => r.description },
  { key: "date", header: "Date", cell: (r) => r.date },
];

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_EXPENSES.filter((r) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.category.toLowerCase().includes(q) ||
        getVehicleLabel(r.vehicle_id).toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchesCategory = category === "all" || r.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <ModulePage
      title="Expenses"
      description="Operational expense tracking and categorization"
      filters={
        <ModuleFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search category, vehicle, description…"
          filters={[
            {
              id: "expense-cat",
              label: "Category",
              options: [
                { label: "All", value: "all" },
                { label: "Tolls", value: "Tolls" },
                { label: "Repairs", value: "Repairs" },
                { label: "Permits", value: "Permits" },
                { label: "Parking", value: "Parking" },
                { label: "Fines", value: "Fines" },
                { label: "Loading", value: "Loading" },
              ],
              value: category,
              onChange: setCategory,
            },
          ]}
        />
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        emptyMessage="No expenses found."
      />
    </ModulePage>
  );
}
