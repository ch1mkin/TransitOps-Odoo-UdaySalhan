"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  cell: (row: T, serialNo: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  renderRowActions?: (row: T) => React.ReactNode;
  getRowId: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  emptyMessage = "No records found.",
  onRowClick,
  renderRowActions,
  getRowId,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const serialOffset = (currentPage - 1) * pageSize;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
            <tr>
              <th className="w-14 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
              {renderRowActions && (
                <th className="w-16 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pop
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1 + (renderRowActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row, index) => {
                const serialNo = serialOffset + index + 1;
                return (
                  <tr
                    key={getRowId(row)}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/40"
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {String(serialNo).padStart(2, "0")}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3", col.className)}
                      >
                        {col.cell(row, serialNo)}
                      </td>
                    ))}
                    {renderRowActions && (
                      <td className="px-4 py-3 text-right">
                        {renderRowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {pageData.length === 0 ? 0 : serialOffset + 1}–
          {serialOffset + pageData.length} of {data.length} records
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[80px] text-center text-xs text-muted-foreground">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
