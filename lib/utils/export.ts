"use client";

import * as XLSX from "xlsx";

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

export function exportToExcel<T>(
  filename: string,
  rows: T[],
  columns: ExportColumn<T>[],
  sheetName = "Records"
) {
  if (rows.length === 0) {
    return false;
  }

  const sheetRows = rows.map((row) =>
    Object.fromEntries(columns.map((col) => [col.header, col.value(row) ?? ""]))
  );

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, `${filename}.xlsx`);
  return true;
}
