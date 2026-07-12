"use client";

import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ExportButton } from "@/components/data/export-button";
import { ModuleFilters } from "@/components/data/module-filters";
import { ModulePage } from "@/components/data/module-page";
import { StatusBadge } from "@/components/data/status-badge";
import { isLicenseExpired } from "@/lib/fleet/trip-lifecycle";
import { exportFilter } from "@/lib/utils/export";
import { ROLES } from "@/constants/roles";
import { useSettingsStore } from "@/store/settings-store";
import type { Driver } from "@/types/entities";

function daysUntil(expiry: string) {
  const diff = new Date(expiry).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const columns: DataTableColumn<Driver>[] = [
  {
    key: "name",
    header: "Driver",
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  { key: "license", header: "License No.", cell: (row) => row.license_number },
  { key: "category", header: "Category", cell: (row) => row.license_category },
  { key: "expiry", header: "Expiry", cell: (row) => row.license_expiry },
  {
    key: "days",
    header: "Days Left",
    className: "text-right",
    cell: (row) => {
      const days = daysUntil(row.license_expiry);
      if (isLicenseExpired(row.license_expiry)) {
        return <span className="text-destructive">Expired</span>;
      }
      if (days <= 30) {
        return <span className="text-amber-600">{days}d</span>;
      }
      return <span>{days}d</span>;
    },
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

interface LicenseMonitoringModuleProps {
  drivers: Driver[];
}

export function LicenseMonitoringModule({ drivers }: LicenseMonitoringModuleProps) {
  const warningDays = useSettingsStore(
    (s) => s.byRole[ROLES.SAFETY_OFFICER].licenseExpiryWarningDays
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return drivers.filter((driver) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        driver.name.toLowerCase().includes(q) ||
        driver.license_number.toLowerCase().includes(q);

      const expired = isLicenseExpired(driver.license_expiry);
      const expiringSoon =
        !expired && daysUntil(driver.license_expiry) <= warningDays;

      const matchesFilter =
        filter === "all" ||
        (filter === "expired" && expired) ||
        (filter === "expiring" && expiringSoon) ||
        (filter === "valid" && !expired && !expiringSoon);

      return matchesSearch && matchesFilter;
    });
  }, [drivers, search, filter, warningDays]);

  const stats = useMemo(() => {
    const expired = drivers.filter((d) => isLicenseExpired(d.license_expiry)).length;
    const expiring = drivers.filter(
      (d) =>
        !isLicenseExpired(d.license_expiry) &&
        daysUntil(d.license_expiry) <= warningDays
    ).length;
    return { expired, expiring, valid: drivers.length - expired - expiring };
  }, [drivers, warningDays]);

  return (
    <ModulePage
      title="License Monitoring"
      description={`${stats.expired} expired · ${stats.expiring} expiring within ${warningDays} days · ${stats.valid} valid`}
      actions={
        <ExportButton
          title="License Monitoring Report"
          filename="license-monitoring"
          rows={filtered}
          sheetName="Licenses"
          subtitle={`Warning window: ${warningDays} days`}
          filters={[
            exportFilter("Search", search),
            exportFilter(
              "License Status",
              filter === "all"
                ? "All"
                : filter === "expired"
                  ? "Expired"
                  : filter === "expiring"
                    ? "Expiring soon"
                    : "Valid"
            ),
          ]}
          columns={[
            { header: "Driver", value: (r) => r.name },
            { header: "License", value: (r) => r.license_number },
            { header: "Category", value: (r) => r.license_category },
            { header: "Expiry", value: (r) => r.license_expiry },
            { header: "Status", value: (r) => r.status },
          ]}
        />
      }
      filters={
        <ModuleFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search driver or license…"
          filters={[
            {
              id: "license-filter",
              label: "License Status",
              options: [
                { label: "All", value: "all" },
                { label: "Expired", value: "expired" },
                { label: "Expiring Soon", value: "expiring" },
                { label: "Valid", value: "valid" },
              ],
              value: filter,
              onChange: setFilter,
            },
          ]}
        />
      }
    >
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(row) => row.id}
        emptyMessage="No drivers match your filters."
      />
    </ModulePage>
  );
}
