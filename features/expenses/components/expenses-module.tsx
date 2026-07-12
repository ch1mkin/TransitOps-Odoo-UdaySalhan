"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { Button } from "@/components/ui/button";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import type { ExpenseLog, Vehicle } from "@/types/entities";

interface ExpensesModuleProps {
  records: ExpenseLog[];
  vehicles: Vehicle[];
  vehicleLabels: Record<string, string>;
  canManage?: boolean;
}

export function ExpensesModule({
  records,
  vehicles,
  vehicleLabels,
  canManage = false,
}: ExpensesModuleProps) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const columns: DataTableColumn<ExpenseLog>[] = useMemo(
    () => [
      {
        key: "vehicle",
        header: "Vehicle",
        cell: (r) => (
          <span className="font-medium">{vehicleLabels[r.vehicle_id] ?? "—"}</span>
        ),
      },
      { key: "category", header: "Category", cell: (r) => r.category },
      { key: "description", header: "Description", cell: (r) => r.description },
      {
        key: "amount",
        header: "Amount (₹)",
        className: "text-right",
        cell: (r) => r.amount.toLocaleString(),
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
      return (
        vehicle.includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q)
      );
    });
  }, [records, search, vehicleLabels]);

  return (
    <>
      <ModulePage
        title="Expense Management"
        description="Operational expense tracking by vehicle"
        actions={
          <div className="flex gap-2">
            <ExportButton
              filename="expenses"
              rows={filtered}
              sheetName="Expenses"
              columns={[
                { header: "Vehicle", value: (r) => vehicleLabels[r.vehicle_id] ?? "" },
                { header: "Category", value: (r) => r.category },
                { header: "Description", value: (r) => r.description },
                { header: "Amount", value: (r) => r.amount },
                { header: "Date", value: (r) => r.date },
              ]}
            />
            {canManage ? (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                Record Expense
              </Button>
            ) : null}
          </div>
        }
      filters={
        <ModuleFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vehicle, category, description…"
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

      {canManage ? (
        <ExpenseFormDialog open={formOpen} onOpenChange={setFormOpen} vehicles={vehicles} />
      ) : null}
    </>
  );
}
