export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";

export interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_name: string;
  vehicle_model: string;
  vehicle_type: string;
  max_load_capacity: number;
  odometer: number;
  status: VehicleStatus;
  acquisition_cost: number;
  purchase_date: string;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  phone: string;
  email: string;
  safety_score: number;
  status: DriverStatus;
}

export interface Trip {
  id: string;
  trip_number: string;
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
  status: TripStatus;
  dispatch_time: string | null;
}
