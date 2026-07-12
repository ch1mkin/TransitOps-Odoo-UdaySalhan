"use client";

import { DataTable, type DataTableColumn } from "@/components/data/data-table";
import { ModulePage } from "@/components/data/module-page";
import { ROLE_LABELS } from "@/constants/roles";
import { MOCK_DEMO_ACCOUNTS } from "@/lib/mock-data";

const columns: DataTableColumn<(typeof MOCK_DEMO_ACCOUNTS)[0]>[] = [
  {
    key: "role",
    header: "Role",
    cell: (row) => ROLE_LABELS[row.role],
  },
  {
    key: "name",
    header: "Full Name",
    cell: (row) => <span className="font-medium">{row.full_name}</span>,
  },
  { key: "email", header: "Demo Email", cell: (row) => row.email },
  {
    key: "password",
    header: "Password Hint",
    cell: (row) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
        {row.password_hint}
      </code>
    ),
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <ModulePage
        title="Settings"
        description="Workspace preferences and demo role accounts for hackathon testing"
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Demo Accounts by Role</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Register each account via Sign In → Create Account to test role-based access.
          </p>
        </div>
        <DataTable
          columns={columns}
          data={MOCK_DEMO_ACCOUNTS}
          getRowId={(row) => String(row.serial)}
          emptyMessage="No demo accounts configured."
          pageSize={10}
        />
      </ModulePage>
    </div>
  );
}
