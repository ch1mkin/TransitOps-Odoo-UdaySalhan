import { ROLES, type Role } from "@/constants/roles";

export function canManageVehicles(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canManageDrivers(role: Role) {
  return role === ROLES.FLEET_MANAGER;
}

export function canManageTrips(role: Role) {
  return role === ROLES.FLEET_MANAGER || role === ROLES.DISPATCHER;
}

export function canUpdateDriverSafety(role: Role) {
  return role === ROLES.FLEET_MANAGER || role === ROLES.SAFETY_OFFICER;
}
