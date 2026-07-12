"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportToExcel, type ExportColumn } from "@/lib/utils/export";

interface ExportButtonProps<T> {
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  sheetName?: string;
  label?: string;
}

export function ExportButton<T>({
  filename,
  rows,
  columns,
  sheetName,
  label = "Export Excel",
}: ExportButtonProps<T>) {
  const handleExport = () => {
    const ok = exportToExcel(filename, rows, columns, sheetName);
    if (!ok) {
      toast.error("No records to export.");
      return;
    }
    toast.success(`Exported ${rows.length} records`);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <Download className="size-4" />
      {label}
    </Button>
  );
}
