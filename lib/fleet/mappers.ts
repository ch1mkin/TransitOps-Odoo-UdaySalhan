import type { Driver, Trip, Vehicle } from "@/types/entities";

type VehicleRow = {
  id: string;
  registration_number: string;
  vehicle_name: string;
  vehicle_model: string;
  vehicle_type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number | string;
  status: Vehicle["status"];
  purchase_date: string;
};

type DriverRow = {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  phone: string;
  email: string;
  safety_score: number;
  status: Driver["status"];
};

type TripRow = {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  vehicle_id: string | null;
  driver_id: string | null;
  cargo_weight: number;
  planned_distance: number;
  status: Trip["status"];
  dispatch_time: string | null;
};

export function mapVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    registration_number: row.registration_number,
    vehicle_name: row.vehicle_name,
    vehicle_model: row.vehicle_model,
    vehicle_type: row.vehicle_type,
    max_load_capacity: row.max_load_capacity,
    odometer: row.odometer,
    acquisition_cost: Number(row.acquisition_cost),
    status: row.status,
    purchase_date: row.purchase_date,
  };
}

export function mapDriver(row: DriverRow): Driver {
  return {
    id: row.id,
    name: row.name,
    license_number: row.license_number,
    license_category: row.license_category,
    license_expiry: row.license_expiry,
    phone: row.phone,
    email: row.email,
    safety_score: row.safety_score,
    status: row.status,
  };
}

export function mapTrip(row: TripRow): Trip {
  return {
    id: row.id,
    trip_number: row.trip_number,
    source: row.source,
    destination: row.destination,
    vehicle_id: row.vehicle_id ?? "",
    driver_id: row.driver_id ?? "",
    cargo_weight: row.cargo_weight,
    planned_distance: row.planned_distance,
    status: row.status,
    dispatch_time: row.dispatch_time,
  };
}
