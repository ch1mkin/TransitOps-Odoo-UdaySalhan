"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Columns3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | null | undefined;
  defaultHidden?: boolean;
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
  enableColumnVisibility?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  emptyMessage = "No records found.",
  onRowClick,
  renderRowActions,
  getRowId,
  enableColumnVisibility = true,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    Object.fromEntries(
      columns.filter((col) => col.defaultHidden).map((col) => [col.key, false])
    )
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = [
      {
        id: "__serial",
        header: "#",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {String(row.index + 1).padStart(2, "0")}
          </span>
        ),
        size: 56,
      },
      ...columns.map((col) => ({
        id: col.key,
        accessorFn: (row: T) => col.sortValue?.(row) ?? null,
        header: col.header,
        enableSorting: col.sortable !== false && Boolean(col.sortValue),
        enableHiding: col.key !== "actions",
        cell: ({ row }: { row: { original: T; index: number } }) =>
          col.cell(row.original, row.index + 1),
        meta: { className: col.className },
      })),
    ];

    if (renderRowActions) {
      defs.push({
        id: "__actions",
        header: "Pop",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => renderRowActions(row.original),
        size: 64,
      });
    }

    return defs;
  }, [columns, renderRowActions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => getRowId(row),
    initialState: { pagination: { pageSize } },
  });

  const { pageIndex, pageSize: currentPageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageRows = table.getRowModel().rows;
  const serialOffset = pageIndex * currentPageSize;
  const hideableColumns = table
    .getAllColumns()
    .filter((col) => col.getCanHide() && col.id !== "__serial" && col.id !== "__actions");

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                        header.id === "__serial" && "w-14",
                        header.id === "__actions" && "w-16 text-right",
                        (header.column.columnDef.meta as { className?: string } | undefined)
                          ?.className
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-b border-border last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/40"
                  )}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-4 py-3",
                        cellIndex === 0 && "font-mono text-xs text-muted-foreground",
                        cell.column.id === "__actions" && "text-right",
                        (cell.column.columnDef.meta as { className?: string } | undefined)
                          ?.className
                      )}
                    >
                      {cell.column.id === "__serial"
                        ? String(serialOffset + row.index + 1).padStart(2, "0")
                        : flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="relative flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Showing {pageRows.length === 0 ? 0 : serialOffset + 1}–
          {serialOffset + pageRows.length} of {totalRows} records
        </p>
        <div className="flex items-center gap-1">
          {enableColumnVisibility && hideableColumns.length > 0 ? (
            <div className="relative mr-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setShowColumnMenu((v) => !v)}
                aria-label="Toggle columns"
              >
                <Columns3 className="size-3.5" />
                Columns
              </Button>
              {showColumnMenu ? (
                <div className="absolute bottom-full right-0 z-20 mb-1 w-44 rounded-lg border border-border bg-card p-2 shadow-lg">
                  {hideableColumns.map((col) => {
                    const def = columns.find((c) => c.key === col.id);
                    return (
                      <label
                        key={col.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={col.getIsVisible()}
                          onChange={col.getToggleVisibilityHandler()}
                          className="rounded border-border"
                        />
                        {def?.header ?? col.id}
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[80px] text-center text-xs text-muted-foreground">
            Page {pageIndex + 1} / {Math.max(pageCount, 1)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
