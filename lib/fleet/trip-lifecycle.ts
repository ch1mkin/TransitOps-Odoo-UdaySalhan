import type { Driver, Trip, Vehicle } from "@/types/entities";
import { formatNumber } from "@/lib/utils/format";

export class TripValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripValidationError";
  }
}

export function isLicenseExpired(expiry: string) {
  return new Date(expiry) < new Date(new Date().toDateString());
}

export function assertVehicleDispatchable(vehicle: Vehicle) {
  if (vehicle.status === "Retired") {
    throw new TripValidationError("Retired vehicles cannot be dispatched.");
  }
  if (vehicle.status === "In Shop") {
    throw new TripValidationError("Vehicles in shop cannot be dispatched.");
  }
  if (vehicle.status === "On Trip") {
    throw new TripValidationError("Vehicle is already on a trip.");
  }
}

export function assertDriverAssignable(driver: Driver) {
  if (driver.status === "Suspended") {
    throw new TripValidationError("Suspended drivers cannot be assigned.");
  }
  if (driver.status === "On Trip") {
    throw new TripValidationError("Driver is already on a trip.");
  }
  if (isLicenseExpired(driver.license_expiry)) {
    throw new TripValidationError("Driver license has expired.");
  }
}

export function assertCargoCapacity(cargoWeight: number, vehicle: Vehicle) {
  if (cargoWeight > vehicle.max_load_capacity) {
    throw new TripValidationError(
      `Cargo weight exceeds vehicle capacity (${formatNumber(vehicle.max_load_capacity)} kg).`
    );
  }
}

export function assertTripDispatchable(trip: Trip, vehicle: Vehicle, driver: Driver) {
  if (trip.status !== "Draft") {
    throw new TripValidationError("Only draft trips can be dispatched.");
  }
  assertVehicleDispatchable(vehicle);
  assertDriverAssignable(driver);
  assertCargoCapacity(trip.cargo_weight, vehicle);
}

export function assertTripCompletable(trip: Trip) {
  if (trip.status !== "Dispatched") {
    throw new TripValidationError("Only dispatched trips can be completed.");
  }
}

export function assertTripCancellable(trip: Trip) {
  if (trip.status !== "Draft" && trip.status !== "Dispatched") {
    throw new TripValidationError("Only draft or dispatched trips can be cancelled.");
  }
}
