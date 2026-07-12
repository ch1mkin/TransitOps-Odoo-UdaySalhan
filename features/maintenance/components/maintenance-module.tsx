"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MaintenanceFormDialog } from "@/features/maintenance/components/maintenance-form-dialog";
import { closeMaintenance } from "@/lib/fleet/actions";
import type { MaintenanceLog, Vehicle } from "@/types/entities";

interface MaintenanceModuleProps {
  records: MaintenanceLog[];
  vehicles: Vehicle[];
  vehicleLabels: Record<string, string>;
  canManage?: boolean;
}

export function MaintenanceModule({
  records,
  vehicles,
  vehicleLabels,
  canManage = false,
}: MaintenanceModuleProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null);

  const handleClose = async (id: string) => {
    setClosingId(id);
    const result = await closeMaintenance(id);
    setClosingId(null);
    setConfirmCloseId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Maintenance closed — vehicle returned to Available");
    router.refresh();
  };

  const columns: DataTableColumn<MaintenanceLog>[] = useMemo(
    () => [
      {
        key: "vehicle",
        header: "Vehicle",
        sortValue: (r) => vehicleLabels[r.vehicle_id] ?? "",
        cell: (r) => (
          <span className="font-medium">{vehicleLabels[r.vehicle_id] ?? "—"}</span>
        ),
      },
      { key: "type", header: "Type", sortValue: (r) => r.maintenance_type, cell: (r) => r.maintenance_type },
      { key: "description", header: "Description", sortValue: (r) => r.description, cell: (r) => r.description },
      { key: "center", header: "Service Center", sortValue: (r) => r.service_center, cell: (r) => r.service_center },
      {
        key: "cost",
        header: "Cost (₹)",
        className: "text-right",
        sortValue: (r) => r.cost,
        cell: (r) => r.cost.toLocaleString(),
      },
      { key: "opened", header: "Opened", sortValue: (r) => r.opened_at, cell: (r) => r.opened_at },
      {
        key: "status",
        header: "Status",
        cell: (r) => <StatusBadge status={r.status} />,
      },
      ...(canManage
        ? [
            {
              key: "actions",
              header: "",
              cell: (r: MaintenanceLog) =>
                r.status === "In Progress" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={closingId === r.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmCloseId(r.id);
                    }}
                  >
                    {closingId === r.id ? "Closing…" : "Close"}
                  </Button>
                ) : null,
            } as DataTableColumn<MaintenanceLog>,
          ]
        : []),
    ],
    [vehicleLabels, canManage, closingId]
  );

  const filtered = useMemo(() => {
    return records.filter((row) => {
      const q = search.toLowerCase();
      const vehicle = (vehicleLabels[row.vehicle_id] ?? "").toLowerCase();
      const matchesSearch =
        !q ||
        vehicle.includes(q) ||
        row.maintenance_type.toLowerCase().includes(q) ||
        row.service_center.toLowerCase().includes(q);
      const matchesStatus = status === "all" || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, status, vehicleLabels]);

  return (
    <>
      <ModulePage
        title="Maintenance Management"
        description="Schedule service and close maintenance to release vehicles"
        actions={
          <div className="flex gap-2">
            <ExportButton
              filename="maintenance-logs"
              rows={filtered}
              sheetName="Maintenance"
              columns={[
                { header: "Vehicle", value: (r) => vehicleLabels[r.vehicle_id] ?? "" },
                { header: "Type", value: (r) => r.maintenance_type },
                { header: "Description", value: (r) => r.description },
                { header: "Service Center", value: (r) => r.service_center },
                { header: "Cost", value: (r) => r.cost },
                { header: "Opened", value: (r) => r.opened_at },
                { header: "Status", value: (r) => r.status },
              ]}
            />
            {canManage ? (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                Schedule
              </Button>
            ) : null}
          </div>
        }
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

      {canManage ? (
        <MaintenanceFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          vehicles={vehicles}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmCloseId)}
        onOpenChange={(open) => {
          if (!open) setConfirmCloseId(null);
        }}
        title="Close maintenance?"
        description="The vehicle will be returned to Available if it is not retired."
        confirmLabel="Close maintenance"
        loading={Boolean(closingId)}
        onConfirm={() => {
          if (confirmCloseId) return handleClose(confirmCloseId);
        }}
      />
    </>
  );
}
