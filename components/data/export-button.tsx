"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  exportReport,
  type ExportColumn,
  type ExportFilter,
  type ExportFormat,
} from "@/lib/utils/export";

interface ExportButtonProps<T> {
  title: string;
  filename: string;
  rows: T[];
  columns: ExportColumn<T>[];
  sheetName?: string;
  subtitle?: string;
  filters?: ExportFilter[];
  label?: string;
}

const FORMAT_OPTIONS: {
  format: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileSpreadsheet;
}[] = [
  {
    format: "xlsx",
    label: "Excel (.xlsx)",
    description: "Branded spreadsheet with logo and filters",
    icon: FileSpreadsheet,
  },
  {
    format: "csv",
    label: "CSV (.csv)",
    description: "Comma-separated with export metadata",
    icon: FileText,
  },
  {
    format: "pdf",
    label: "PDF (.pdf)",
    description: "Print-ready report with watermark",
    icon: FileText,
  },
];

export function ExportButton<T>({
  title,
  filename,
  rows,
  columns,
  sheetName,
  subtitle,
  filters = [],
  label = "Export",
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      const ok = await exportReport({
        format,
        filename,
        rows,
        columns,
        sheetName,
        meta: { title, subtitle, filters },
      });

      if (!ok) {
        toast.error("No records to export.");
        return;
      }

      toast.success(`Exported ${rows.length} records as ${format.toUpperCase()}`);
      setOpen(false);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        disabled={Boolean(exporting)}
      >
        <Download className="size-4" />
        {exporting ? `Exporting ${exporting.toUpperCase()}…` : label}
        <ChevronDown className="size-3.5 opacity-70" />
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-medium text-foreground">Choose export format</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Includes export date, active filters, logo, and watermark.
            </p>
          </div>
          <div className="p-1.5">
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  type="button"
                  onClick={() => handleExport(option.format)}
                  disabled={Boolean(exporting)}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:opacity-60"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
