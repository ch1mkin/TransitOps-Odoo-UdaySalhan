export type ExportFormat = "xlsx" | "csv" | "pdf";

export interface ExportFilter {
  label: string;
  value: string;
}

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

export interface ExportMeta {
  title: string;
  subtitle?: string;
  filters?: ExportFilter[];
  exportedAt?: Date;
  recordCount?: number;
}

export interface ExportOptions<T> {
  format: ExportFormat;
  filename: string;
  sheetName?: string;
  rows: T[];
  columns: ExportColumn<T>[];
  meta: ExportMeta;
}
