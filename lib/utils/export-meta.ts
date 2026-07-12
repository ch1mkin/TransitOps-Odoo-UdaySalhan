import { BRAND } from "@/constants/brand";
import type { ExportFilter, ExportMeta } from "@/lib/utils/export-types";

export function formatExportDate(date = new Date()) {
  return date.toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function buildMetaHeaderLines(meta: ExportMeta) {
  const exportedAt = meta.exportedAt ?? new Date();
  const lines = [
    BRAND.name,
    meta.title,
    meta.subtitle,
    `Exported on: ${formatExportDate(exportedAt)}`,
    `Total records: ${meta.recordCount ?? "—"}`,
  ].filter(Boolean) as string[];

  if (meta.filters?.length) {
    lines.push("Applied filters:");
    for (const filter of meta.filters) {
      lines.push(`  • ${filter.label}: ${filter.value}`);
    }
  }

  return lines;
}

export function exportFilter(
  label: string,
  value: string | undefined | null,
  fallback = "All"
): ExportFilter {
  const trimmed = value?.trim();
  return { label, value: trimmed ? trimmed : fallback };
}
