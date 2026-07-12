"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { ModulePage } from "@/components/data/module-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ROLE_LABELS, ROLES, type Role } from "@/constants/roles";
import { MOCK_DEMO_ACCOUNTS } from "@/lib/mock-data";
import {
  DEFAULT_ROLE_SETTINGS,
  useSettingsStore,
  type RoleSettingsMap,
} from "@/store/settings-store";

interface SettingsModuleProps {
  role: Role;
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 border-b border-border py-4 last:border-0 sm:grid-cols-[220px_1fr] sm:items-center">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${
        checked ? "border-primary bg-primary" : "border-border bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function SettingsModule({ role }: SettingsModuleProps) {
  const fleetSettings = useSettingsStore((s) => s.byRole[ROLES.FLEET_MANAGER]);
  const dispatcherSettings = useSettingsStore((s) => s.byRole[ROLES.DISPATCHER]);
  const safetySettings = useSettingsStore((s) => s.byRole[ROLES.SAFETY_OFFICER]);
  const financeSettings = useSettingsStore((s) => s.byRole[ROLES.FINANCIAL_ANALYST]);
  const updateRoleSettings = useSettingsStore((s) => s.updateRoleSettings);
  const resetRoleSettings = useSettingsStore((s) => s.resetRoleSettings);

  const roleDescription = useMemo(() => {
    switch (role) {
      case ROLES.FLEET_MANAGER:
        return "Fleet operations, maintenance alerts, and document compliance preferences.";
      case ROLES.DISPATCHER:
        return "Trip planning defaults and active trip monitoring preferences.";
      case ROLES.SAFETY_OFFICER:
        return "License monitoring thresholds and driver compliance rules.";
      case ROLES.FINANCIAL_ANALYST:
        return "Cost analysis, ROI calculation, and export preferences.";
      default:
        return "Workspace preferences.";
    }
  }, [role]);

  const save = <R extends Role>(patch: Partial<RoleSettingsMap[R]>) => {
    updateRoleSettings(role, patch);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-4">
      <ModulePage
        title="Settings"
        description={`${ROLE_LABELS[role]} — ${roleDescription}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetRoleSettings(role);
              toast.success("Settings reset to defaults");
            }}
          >
            Reset to defaults
          </Button>
        }
      >
        <div className="px-4 py-3 text-sm text-muted-foreground">
          Preferences are stored locally in your browser for this role.
        </div>
      </ModulePage>

      {role === ROLES.FLEET_MANAGER && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fleet Operations</CardTitle>
            <CardDescription>
              Alerts and display options for vehicle registry and maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <SettingRow
              label="Document expiry warning"
              description="Highlight documents expiring within this many days."
            >
              <Input
                type="number"
                min={7}
                max={365}
                className="max-w-[120px]"
                value={fleetSettings.documentExpiryDays}
                onChange={(e) =>
                  save({ documentExpiryDays: Number(e.target.value) })
                }
              />
            </SettingRow>
            <SettingRow
              label="Maintenance cost alert (₹)"
              description="Flag maintenance logs above this cost on the dashboard."
            >
              <Input
                type="number"
                min={0}
                className="max-w-[160px]"
                value={fleetSettings.maintenanceCostAlert}
                onChange={(e) =>
                  save({ maintenanceCostAlert: Number(e.target.value) })
                }
              />
            </SettingRow>
            <SettingRow label="Compact tables" description="Denser rows in list views.">
              <Toggle
                label="Compact tables"
                checked={fleetSettings.compactTables}
                onChange={(v) => save({ compactTables: v })}
              />
            </SettingRow>
          </CardContent>
        </Card>
      )}

      {role === ROLES.DISPATCHER && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dispatch Preferences</CardTitle>
            <CardDescription>
              Control trip creation defaults and active trip monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <SettingRow
              label="Eligible-only in trip form"
              description="Show only available vehicles and eligible drivers when creating trips."
            >
              <Toggle
                label="Eligible-only in trip form"
                checked={dispatcherSettings.showOnlyEligibleInTripForm}
                onChange={(v) => save({ showOnlyEligibleInTripForm: v })}
              />
            </SettingRow>
            <SettingRow
              label="Active trips refresh (sec)"
              description="How often to suggest refreshing the Active Trips view."
            >
              <Input
                type="number"
                min={15}
                max={300}
                className="max-w-[120px]"
                value={dispatcherSettings.activeTripsRefreshSeconds}
                onChange={(e) =>
                  save({ activeTripsRefreshSeconds: Number(e.target.value) })
                }
              />
            </SettingRow>
            <SettingRow label="Default trips view" description="Landing filter on Create Trip.">
              <Select
                value={dispatcherSettings.defaultTripsView}
                onChange={(e) =>
                  save({ defaultTripsView: e.target.value as "draft" | "all" })
                }
                className="max-w-[200px]"
              >
                <option value="draft">Draft trips first</option>
                <option value="all">All open trips</option>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>
      )}

      {role === ROLES.SAFETY_OFFICER && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Safety & Compliance</CardTitle>
            <CardDescription>
              License monitoring and driver eligibility thresholds.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <SettingRow
              label="License expiry warning (days)"
              description="Used on License Monitoring and dashboard KPIs."
            >
              <Input
                type="number"
                min={7}
                max={180}
                className="max-w-[120px]"
                value={safetySettings.licenseExpiryWarningDays}
                onChange={(e) =>
                  save({ licenseExpiryWarningDays: Number(e.target.value) })
                }
              />
            </SettingRow>
            <SettingRow
              label="Minimum safety score"
              description="Drivers below this score are flagged as dispatch risks."
            >
              <Input
                type="number"
                min={0}
                max={100}
                className="max-w-[120px]"
                value={safetySettings.minimumSafetyScore}
                onChange={(e) =>
                  save({ minimumSafetyScore: Number(e.target.value) })
                }
              />
            </SettingRow>
            <SettingRow
              label="Highlight suspended drivers"
              description="Emphasize suspended drivers in the roster table."
            >
              <Toggle
                label="Highlight suspended drivers"
                checked={safetySettings.highlightSuspendedDrivers}
                onChange={(v) => save({ highlightSuspendedDrivers: v })}
              />
            </SettingRow>
          </CardContent>
        </Card>
      )}

      {role === ROLES.FINANCIAL_ANALYST && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Analysis</CardTitle>
            <CardDescription>ROI modeling and export defaults.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <SettingRow
              label="ROI amortization (%)"
              description="Annual acquisition cost % used in ROI Analytics."
            >
              <Input
                type="number"
                min={1}
                max={50}
                className="max-w-[120px]"
                value={financeSettings.roiAmortizationPercent}
                onChange={(e) =>
                  save({ roiAmortizationPercent: Number(e.target.value) })
                }
              />
            </SettingRow>
            <SettingRow label="Default export format">
              <Select
                value={financeSettings.defaultExportFormat}
                onChange={(e) =>
                  save({ defaultExportFormat: e.target.value as "xlsx" | "csv" })
                }
                className="max-w-[160px]"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
              </Select>
            </SettingRow>
            <SettingRow
              label="Show cost breakdown"
              description="Split fuel vs expenses on financial reports."
            >
              <Toggle
                label="Show cost breakdown"
                checked={financeSettings.showCostBreakdown}
                onChange={(v) => save({ showCostBreakdown: v })}
              />
            </SettingRow>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demo Accounts</CardTitle>
          <CardDescription>
            Register these via Create Account to test each role (password hint shown).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border">
            {MOCK_DEMO_ACCOUNTS.map((account) => (
              <div
                key={account.serial}
                className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{ROLE_LABELS[account.role]}</p>
                  <p className="text-muted-foreground">{account.full_name}</p>
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  <p>{account.email}</p>
                  <code className="rounded bg-muted px-1.5 py-0.5">
                    {account.password_hint}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Defaults reference</CardTitle>
          <CardDescription>Factory values for this role if you reset settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            {JSON.stringify(DEFAULT_ROLE_SETTINGS[role], null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
