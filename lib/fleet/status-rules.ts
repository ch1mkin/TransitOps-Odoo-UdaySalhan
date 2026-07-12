import type { DriverStatus, VehicleStatus } from "@/types/entities";

export const MANUAL_VEHICLE_STATUSES: VehicleStatus[] = [
  "Available",
  "In Shop",
  "Retired",
];

export const MANUAL_DRIVER_STATUSES: DriverStatus[] = [
  "Available",
  "Off Duty",
  "Suspended",
];

export function assertVehicleStatusChange(
  current: VehicleStatus,
  next: VehicleStatus
) {
  if (current === "On Trip") {
    throw new Error("Cannot change status while vehicle is on a trip.");
  }
  if (next === "On Trip") {
    throw new Error("On Trip is set automatically when a trip is dispatched.");
  }
  if (!MANUAL_VEHICLE_STATUSES.includes(next)) {
    throw new Error("Invalid vehicle status.");
  }
}

export function assertDriverStatusChange(current: DriverStatus, next: DriverStatus) {
  if (current === "On Trip") {
    throw new Error("Cannot change status while driver is on a trip.");
  }
  if (next === "On Trip") {
    throw new Error("On Trip is set automatically when a trip is dispatched.");
  }
  if (!MANUAL_DRIVER_STATUSES.includes(next)) {
    throw new Error("Invalid driver status.");
  }
}
