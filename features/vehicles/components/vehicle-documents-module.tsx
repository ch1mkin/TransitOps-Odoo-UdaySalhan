"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { Button } from "@/components/ui/button";
import { VehicleDocumentFormDialog } from "@/features/vehicles/components/vehicle-document-form-dialog";
import { DocumentDownloadButton } from "@/features/vehicles/components/document-download-button";
import { isLicenseExpired } from "@/lib/fleet/trip-lifecycle";
import { exportFilter } from "@/lib/utils/export";
import type { Vehicle, VehicleDocument } from "@/types/entities";

const columns = (
  vehicleLabels: Record<string, string>
): DataTableColumn<VehicleDocument>[] => [
  {
    key: "vehicle",
    header: "Vehicle",
    sortValue: (row) => vehicleLabels[row.vehicle_id] ?? "",
    cell: (row) => (
      <span className="font-medium">{vehicleLabels[row.vehicle_id] ?? "—"}</span>
    ),
  },
  {
    key: "type",
    header: "Document Type",
    sortValue: (row) => row.document_type,
    cell: (row) => row.document_type,
  },
  {
    key: "file",
    header: "File",
    sortValue: (row) => row.file_name,
    cell: (row) => (
      <DocumentDownloadButton fileName={row.file_name} storagePath={row.storage_path} />
    ),
  },
  {
    key: "expiry",
    header: "Expiry",
    sortValue: (row) => row.expiry_date ?? "",
    cell: (row) =>
      row.expiry_date ? (
        isLicenseExpired(row.expiry_date) ? (
          <span className="text-destructive">{row.expiry_date}</span>
        ) : (
          row.expiry_date
        )
      ) : (
        "—"
      ),
  },
  { key: "notes", header: "Notes", sortValue: (row) => row.notes ?? "", cell: (row) => row.notes ?? "—" },
];

interface VehicleDocumentsModuleProps {
  documents: VehicleDocument[];
  vehicles: Vehicle[];
  vehicleLabels: Record<string, string>;
  canManage?: boolean;
}

export function VehicleDocumentsModule({
  documents,
  vehicles,
  vehicleLabels,
  canManage = false,
}: VehicleDocumentsModuleProps) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return documents;
    const q = search.toLowerCase();
    return documents.filter((doc) => {
      const vehicle = (vehicleLabels[doc.vehicle_id] ?? "").toLowerCase();
      return (
        vehicle.includes(q) ||
        doc.document_type.toLowerCase().includes(q) ||
        doc.file_name.toLowerCase().includes(q)
      );
    });
  }, [documents, search, vehicleLabels]);

  return (
    <>
      <ModulePage
        title="Vehicle Documents"
        description="Registration, insurance, fitness certificates, and compliance files"
        actions={
          <div className="flex gap-2">
            <ExportButton
              title="Vehicle Documents Report"
              filename="vehicle-documents"
              rows={filtered}
              sheetName="Documents"
              filters={[exportFilter("Search", search)]}
              columns={[
                { header: "Vehicle", value: (r) => vehicleLabels[r.vehicle_id] ?? "" },
                { header: "Type", value: (r) => r.document_type },
                { header: "File", value: (r) => r.file_name },
                { header: "Expiry", value: (r) => r.expiry_date ?? "" },
                { header: "Notes", value: (r) => r.notes ?? "" },
              ]}
            />
            {canManage ? (
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="size-4" />
                Add Document
              </Button>
            ) : null}
          </div>
        }
        filters={
          <ModuleFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search vehicle, type, file…"
          />
        }
      >
        <DataTable
          columns={columns(vehicleLabels)}
          data={filtered}
          getRowId={(row) => row.id}
          emptyMessage="No documents found. Run migrations 008 and 009 in Supabase."
        />
      </ModulePage>

      {canManage ? (
        <VehicleDocumentFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          vehicles={vehicles}
        />
      ) : null}
    </>
  );
}
