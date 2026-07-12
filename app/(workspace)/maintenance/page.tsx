"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { StatusBadge } from "@/components/data/status-badge";
import { MOCK_MAINTENANCE, getVehicleLabel } from "@/lib/mock-data";

const columns: DataTableColumn<(typeof MOCK_MAINTENANCE)[0]>[] = [
  {
    key: "vehicle",
    header: "Vehicle",
    cell: (r) => (
      <span className="font-medium">{getVehicleLabel(r.vehicle_id)}</span>
    ),
  },
  { key: "type", header: "Type", cell: (r) => r.maintenance_type },
  { key: "description", header: "Description", cell: (r) => r.description },
  { key: "center", header: "Service Center", cell: (r) => r.service_center },
  {
    key: "cost",
    header: "Cost (₹)",
    className: "text-right",
    cell: (r) => r.cost.toLocaleString(),
  },
  { key: "opened", header: "Opened", cell: (r) => r.opened_at },
  {
    key: "status",
    header: "Status",
    cell: (r) => <StatusBadge status={r.status} />,
  },
];

export default function MaintenancePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_MAINTENANCE.filter((row) => {
      const q = search.toLowerCase();
      const vehicle = getVehicleLabel(row.vehicle_id).toLowerCase();
      const matchesSearch =
        !q ||
        vehicle.includes(q) ||
        row.maintenance_type.toLowerCase().includes(q) ||
        row.service_center.toLowerCase().includes(q);
      const matchesStatus = status === "all" || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <ModulePage
      title="Maintenance"
      description="Vehicle maintenance logs and service tracking"
      filters={
        <ModuleFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search vehicle, type, center…"
          filters={[
            {
              id: "maint-status",
              label: "Status",
              options: [
                { label: "All", value: "all" },
                { label: "In Progress", value: "In Progress" },
                { label: "Completed", value: "Completed" },
              ],
              value: status,
              onChange: setStatus,
            },
          ]}
        />
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(r) => r.id}
        emptyMessage="No maintenance records found."
      />
    </ModulePage>
  );
}
