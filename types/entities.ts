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
  completion_time?: string | null;
  actual_distance?: number | null;
  fuel_used?: number | null;
  revenue?: number | null;
}

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  cost: number;
  service_center: string;
  status: string;
  opened_at: string;
  closed_at?: string | null;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  trip_id?: string | null;
  liters: number;
  cost: number;
  odometer: number;
  date: string;
}

export interface ExpenseLog {
  id: string;
  vehicle_id: string;
  trip_id?: string | null;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: string;
  file_name: string;
  storage_path?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
}

export interface DriverDocument {
  id: string;
  driver_id: string;
  document_type: string;
  file_name: string;
  storage_path: string;
  created_at: string;
}

export interface DriverUploadSession {
  id: string;
  token: string;
  document_type: string;
  status: "waiting" | "uploaded" | "completed" | "expired";
  temp_storage_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  expires_at: string;
}

export interface TripUpdate {
  id: string;
  trip_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  event_type: string;
  message: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string | null;
  read_at?: string | null;
  created_at: string;
}
