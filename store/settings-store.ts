import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLES, type Role } from "@/constants/roles";

export interface FleetManagerSettings {
  documentExpiryDays: number;
  maintenanceCostAlert: number;
  compactTables: boolean;
}

export interface DispatcherSettings {
  showOnlyEligibleInTripForm: boolean;
  activeTripsRefreshSeconds: number;
  defaultTripsView: "draft" | "all";
}

export interface SafetyOfficerSettings {
  licenseExpiryWarningDays: number;
  minimumSafetyScore: number;
  highlightSuspendedDrivers: boolean;
}

export interface FinancialAnalystSettings {
  roiAmortizationPercent: number;
  defaultExportFormat: "xlsx" | "csv";
  showCostBreakdown: boolean;
}

export interface RoleSettingsMap {
  [ROLES.FLEET_MANAGER]: FleetManagerSettings;
  [ROLES.DISPATCHER]: DispatcherSettings;
  [ROLES.SAFETY_OFFICER]: SafetyOfficerSettings;
  [ROLES.FINANCIAL_ANALYST]: FinancialAnalystSettings;
}

export const DEFAULT_ROLE_SETTINGS: RoleSettingsMap = {
  [ROLES.FLEET_MANAGER]: {
    documentExpiryDays: 30,
    maintenanceCostAlert: 50000,
    compactTables: false,
  },
  [ROLES.DISPATCHER]: {
    showOnlyEligibleInTripForm: true,
    activeTripsRefreshSeconds: 60,
    defaultTripsView: "draft",
  },
  [ROLES.SAFETY_OFFICER]: {
    licenseExpiryWarningDays: 30,
    minimumSafetyScore: 70,
    highlightSuspendedDrivers: true,
  },
  [ROLES.FINANCIAL_ANALYST]: {
    roiAmortizationPercent: 10,
    defaultExportFormat: "xlsx",
    showCostBreakdown: true,
  },
};

interface SettingsState {
  byRole: RoleSettingsMap;
  updateRoleSettings: <R extends Role>(role: R, patch: Partial<RoleSettingsMap[R]>) => void;
  resetRoleSettings: (role: Role) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      byRole: DEFAULT_ROLE_SETTINGS,
      updateRoleSettings: (role, patch) =>
        set((state) => ({
          byRole: {
            ...state.byRole,
            [role]: { ...state.byRole[role], ...patch },
          },
        })),
      resetRoleSettings: (role) =>
        set((state) => ({
          byRole: {
            ...state.byRole,
            [role]: DEFAULT_ROLE_SETTINGS[role],
          },
        })),
    }),
    { name: "transitops-settings" }
  )
);

export function getRoleSettings<R extends Role>(role: R): RoleSettingsMap[R] {
  return useSettingsStore.getState().byRole[role];
}
