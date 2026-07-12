"use client";

import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND } from "@/constants/brand";
import { createWatermarkDataUrl, loadBrandImage } from "@/lib/utils/export-brand";
import { buildMetaHeaderLines, formatExportDate } from "@/lib/utils/export-meta";
import type { ExportColumn, ExportMeta, ExportOptions } from "@/lib/utils/export-types";

function escapeCsvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToMatrix<T>(rows: T[], columns: ExportColumn<T>[]) {
  return rows.map((row) =>
    columns.map((col) => {
      const value = col.value(row);
      return value == null ? "" : String(value);
    })
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function addPdfWatermark(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();
  doc.setTextColor(210, 210, 210);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(46);
  doc.text(BRAND.name, pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 35,
  });
  doc.restoreGraphicsState();
}

async function exportToCsv<T>(
  filename: string,
  rows: T[],
  columns: ExportColumn<T>[],
  meta: ExportMeta
) {
  const headerLines = buildMetaHeaderLines({ ...meta, recordCount: rows.length });
  const lines = [
    ...headerLines.map((line) => `# ${line}`),
    "",
    columns.map((col) => escapeCsvCell(col.header)).join(","),
    ...rowsToMatrix(rows, columns).map((row) =>
      row.map((cell) => escapeCsvCell(cell)).join(",")
    ),
  ];

  const blob = new Blob(["\uFEFF", lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `${filename}.csv`);
}

async function exportToExcel<T>(
  filename: string,
  rows: T[],
  columns: ExportColumn<T>[],
  meta: ExportMeta,
  sheetName: string
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = BRAND.name;
  workbook.created = meta.exportedAt ?? new Date();

  const sheet = workbook.addWorksheet(sheetName.slice(0, 31));
  const logo = await loadBrandImage();
  const watermark = createWatermarkDataUrl();

  if (logo) {
    const logoId = workbook.addImage({
      base64: logo.base64,
      extension: "png",
    });
    sheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 52, height: 52 },
    });
  }

  if (watermark) {
    const watermarkId = workbook.addImage({
      base64: watermark.split(",")[1] ?? "",
      extension: "png",
    });
    sheet.addImage(watermarkId, {
      tl: { col: 1.5, row: 4 },
      ext: { width: 520, height: 260 },
    });
  }

  const titleCell = sheet.getCell("C1");
  titleCell.value = BRAND.name;
  titleCell.font = { bold: true, size: 16, color: { argb: "FF0F2744" } };

  sheet.getCell("C2").value = meta.title;
  sheet.getCell("C2").font = { bold: true, size: 13 };

  if (meta.subtitle) {
    sheet.getCell("C3").value = meta.subtitle;
    sheet.getCell("C3").font = { size: 11, color: { argb: "FF6B7280" } };
  }

  const exportedRow = meta.subtitle ? 4 : 3;
  sheet.getCell(`C${exportedRow}`).value = `Exported on: ${formatExportDate(meta.exportedAt)}`;
  sheet.getCell(`C${exportedRow}`).font = { size: 10, color: { argb: "FF6B7280" } };

  let filterRow = exportedRow + 1;
  sheet.getCell(`C${filterRow}`).value = `Total records: ${rows.length}`;
  sheet.getCell(`C${filterRow}`).font = { size: 10, color: { argb: "FF6B7280" } };
  filterRow += 1;

  if (meta.filters?.length) {
    sheet.getCell(`C${filterRow}`).value = "Applied filters:";
    sheet.getCell(`C${filterRow}`).font = { bold: true, size: 10 };
    filterRow += 1;

    for (const filter of meta.filters) {
      sheet.getCell(`C${filterRow}`).value = `${filter.label}: ${filter.value}`;
      sheet.getCell(`C${filterRow}`).font = { size: 10, color: { argb: "FF4B5563" } };
      filterRow += 1;
    }
  }

  const tableHeaderRow = filterRow + 1;
  const headerRow = sheet.getRow(tableHeaderRow);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F2744" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
  });

  rowsToMatrix(rows, columns).forEach((rowValues, rowIndex) => {
    const row = sheet.getRow(tableHeaderRow + 1 + rowIndex);
    rowValues.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      cell.border = {
        top: { style: "thin", color: { argb: "FFF3F4F6" } },
        left: { style: "thin", color: { argb: "FFF3F4F6" } },
        bottom: { style: "thin", color: { argb: "FFF3F4F6" } },
        right: { style: "thin", color: { argb: "FFF3F4F6" } },
      };
    });
  });

  columns.forEach((_, index) => {
    const column = sheet.getColumn(index + 1);
    column.width = Math.min(36, Math.max(14, columns[index]?.header.length ?? 12));
  });

  sheet.getRow(1).height = 42;
  sheet.views = [{ state: "frozen", ySplit: tableHeaderRow }];

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`
  );
}

async function exportToPdf<T>(
  filename: string,
  rows: T[],
  columns: ExportColumn<T>[],
  meta: ExportMeta
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const logo = await loadBrandImage();
  const pageWidth = doc.internal.pageSize.getWidth();

  addPdfWatermark(doc);

  let cursorY = 14;
  if (logo) {
    doc.addImage(logo.dataUrl, "PNG", 14, 10, 14, 14);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 39, 68);
  doc.text(BRAND.name, 32, cursorY);

  doc.setFontSize(12);
  doc.text(meta.title, 32, (cursorY += 7));

  if (meta.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(meta.subtitle, 32, (cursorY += 6));
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(`Exported on: ${formatExportDate(meta.exportedAt)}`, 32, (cursorY += 6));
  doc.text(`Total records: ${rows.length}`, 32, (cursorY += 5));

  if (meta.filters?.length) {
    cursorY += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Applied filters", 14, (cursorY += 5));
    doc.setFont("helvetica", "normal");
    for (const filter of meta.filters) {
      doc.text(`${filter.label}: ${filter.value}`, 16, (cursorY += 4.5));
    }
  }

  autoTable(doc, {
    head: [columns.map((col) => col.header)],
    body: rowsToMatrix(rows, columns),
    startY: cursorY + 6,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 39, 68],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
      addPdfWatermark(doc);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `${BRAND.name} · ${meta.title}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: "center" }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

export async function exportReport<T>({
  format,
  filename,
  rows,
  columns,
  meta,
  sheetName = "Records",
}: ExportOptions<T>) {
  if (rows.length === 0) {
    return false;
  }

  const enrichedMeta: ExportMeta = {
    ...meta,
    exportedAt: meta.exportedAt ?? new Date(),
    recordCount: rows.length,
  };

  if (format === "csv") {
    await exportToCsv(filename, rows, columns, enrichedMeta);
  } else if (format === "xlsx") {
    await exportToExcel(filename, rows, columns, enrichedMeta, sheetName);
  } else {
    await exportToPdf(filename, rows, columns, enrichedMeta);
  }

  return true;
}

export type { ExportColumn, ExportFilter, ExportFormat, ExportMeta } from "@/lib/utils/export-types";
export { exportFilter } from "@/lib/utils/export-meta";
