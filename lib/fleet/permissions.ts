import { ROLES, type Role } from "@/constants/roles";

export type FleetModule =
  | "dashboard"
  | "notifications"
  | "vehicles"
  | "vehicle_documents"
  | "drivers"
  | "license_monitoring"
  | "trips"
  | "trips_active"
  | "trips_history"
  | "maintenance"
  | "fuel"
  | "expenses"
  | "reports"
  | "reports_roi"
  | "settings"
  | "profile";

const ROLE_MODULES: Record<Role, FleetModule[]> = {
  [ROLES.FLEET_MANAGER]: [
    "dashboard",
    "notifications",
    "vehicles",
    "vehicle_documents",
    "maintenance",
    "reports",
    "settings",
    "profile",
  ],
  [ROLES.DISPATCHER]: [
    "dashboard",
    "notifications",
    "trips",
    "trips_active",
    "trips_history",
    "settings",
    "profile",
  ],
  [ROLES.SAFETY_OFFICER]: [
    "dashboard",
    "notifications",
    "drivers",
    "license_monitoring",
    "reports",
    "settings",
    "profile",
  ],
  [ROLES.FINANCIAL_ANALYST]: [
    "dashboard",
    "notifications",
    "fuel",
    "expenses",
    "reports",
    "reports_roi",
    "settings",
    "profile",
  ],
};

export function canAccessModule(role: Role, module: FleetModule): boolean {
  return ROLE_MODULES[role]?.includes(module) ?? false;
}

export function canManageVehicles(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canRetireVehicles(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canManageDrivers(role: Role) {
  return role === ROLES.SAFETY_OFFICER;
}

export function canUpdateDriverSafety(role: Role) {
  return role === ROLES.SAFETY_OFFICER;
}

export function canSuspendDrivers(role: Role) {
  return role === ROLES.SAFETY_OFFICER;
}

export function canCreateTrips(role: Role) {
  return role === ROLES.DISPATCHER;
}

export function canManageTripLifecycle(role: Role) {
  return role === ROLES.DISPATCHER;
}

export function canViewTrips(role: Role) {
  return (
    role === ROLES.DISPATCHER ||
    role === ROLES.SAFETY_OFFICER ||
    role === ROLES.FINANCIAL_ANALYST
  );
}

export function canManageMaintenance(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canManageFuel(role: Role) {
  return role === ROLES.FINANCIAL_ANALYST;
}

export function canManageExpenses(role: Role) {
  return role === ROLES.FINANCIAL_ANALYST;
}

export function canManageVehicleDocuments(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canChangeVehicleStatus(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canChangeDriverStatus(role: Role) {
  return role === ROLES.SAFETY_OFFICER;
}

export function getReportVariant(role: Role): "fleet" | "safety" | "financial" {
  switch (role) {
    case ROLES.SAFETY_OFFICER:
      return "safety";
    case ROLES.FINANCIAL_ANALYST:
      return "financial";
    default:
      return "fleet";
  }
}

export function getDefaultRoute(role: Role): string {
  return "/dashboard";
}

export function pathnameToModule(pathname: string): FleetModule | null {
  const base = pathname.split("?")[0];

  if (base === "/dashboard") return "dashboard";
  if (base === "/notifications") return "notifications";
  if (base === "/vehicle-documents") return "vehicle_documents";
  if (base === "/license-monitoring") return "license_monitoring";
  if (base === "/trips/active") return "trips_active";
  if (base === "/trips/history") return "trips_history";
  if (base === "/reports/roi") return "reports_roi";
  if (base === "/reports") return "reports";
  if (base === "/maintenance") return "maintenance";
  if (base === "/fuel") return "fuel";
  if (base === "/expenses") return "expenses";
  if (base === "/settings") return "settings";
  if (base === "/profile") return "profile";

  if (base === "/vehicles" || /^\/vehicles\/[^/]+$/.test(base)) {
    return "vehicles";
  }
  if (base === "/drivers" || /^\/drivers\/[^/]+$/.test(base)) {
    return "drivers";
  }
  if (base === "/trips" || /^\/trips\/[^/]+$/.test(base)) {
    if (base === "/trips/active") return "trips_active";
    if (base === "/trips/history") return "trips_history";
    return "trips";
  }

  return null;
}

function canAccessEntityPath(role: Role, pathname: string): boolean {
  const base = pathname.split("?")[0];

  if (/^\/vehicles\/[^/]+$/.test(base)) {
    return role === ROLES.FLEET_MANAGER;
  }
  if (/^\/drivers\/[^/]+$/.test(base)) {
    return role === ROLES.SAFETY_OFFICER;
  }
  if (/^\/trips\/[^/]+$/.test(base)) {
    return canViewTrips(role);
  }

  return true;
}

export function canAccessPath(role: Role, pathname: string): boolean {
  const module = pathnameToModule(pathname);
  if (!module) return true;
  if (!canAccessModule(role, module)) return false;
  return canAccessEntityPath(role, pathname);
}
