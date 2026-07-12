import type {
  AppNotification,
  Driver,
  DriverDocument,
  ExpenseLog,
  FuelLog,
  MaintenanceLog,
  Trip,
  TripUpdate,
  Vehicle,
  VehicleDocument,
} from "@/types/entities";

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
  actual_distance?: number | null;
  fuel_used?: number | string | null;
  revenue?: number | string | null;
  status: Trip["status"];
  dispatch_time: string | null;
  completion_time?: string | null;
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
    actual_distance: row.actual_distance ?? null,
    fuel_used: row.fuel_used != null ? Number(row.fuel_used) : null,
    revenue: row.revenue != null ? Number(row.revenue) : null,
    status: row.status,
    dispatch_time: row.dispatch_time,
    completion_time: row.completion_time ?? null,
  };
}

export function mapMaintenance(row: {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  cost: number | string;
  service_center: string;
  status: string;
  opened_at: string;
  closed_at?: string | null;
}): MaintenanceLog {
  return {
    id: row.id,
    vehicle_id: row.vehicle_id,
    maintenance_type: row.maintenance_type,
    description: row.description,
    cost: Number(row.cost),
    service_center: row.service_center,
    status: row.status,
    opened_at: row.opened_at,
    closed_at: row.closed_at,
  };
}

export function mapFuelLog(row: {
  id: string;
  vehicle_id: string;
  trip_id?: string | null;
  liters: number | string;
  cost: number | string;
  odometer: number;
  date: string;
}): FuelLog {
  return {
    id: row.id,
    vehicle_id: row.vehicle_id,
    trip_id: row.trip_id,
    liters: Number(row.liters),
    cost: Number(row.cost),
    odometer: row.odometer,
    date: row.date,
  };
}

export function mapExpense(row: {
  id: string;
  vehicle_id: string;
  trip_id?: string | null;
  category: string;
  amount: number | string;
  description: string;
  date: string;
}): ExpenseLog {
  return {
    id: row.id,
    vehicle_id: row.vehicle_id,
    trip_id: row.trip_id,
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
    date: row.date,
  };
}

export function mapVehicleDocument(row: {
  id: string;
  vehicle_id: string;
  document_type: string;
  file_name: string;
  storage_path?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
}): VehicleDocument {
  return {
    id: row.id,
    vehicle_id: row.vehicle_id,
    document_type: row.document_type,
    file_name: row.file_name,
    storage_path: row.storage_path,
    expiry_date: row.expiry_date,
    notes: row.notes,
  };
}

export function mapDriverDocument(row: {
  id: string;
  driver_id: string;
  document_type: string;
  file_name: string;
  storage_path: string;
  created_at: string;
}): DriverDocument {
  return {
    id: row.id,
    driver_id: row.driver_id,
    document_type: row.document_type,
    file_name: row.file_name,
    storage_path: row.storage_path,
    created_at: row.created_at,
  };
}

export function mapTripUpdate(row: {
  id: string;
  trip_id: string;
  actor_id?: string | null;
  event_type: string;
  message: string;
  created_at: string;
  profiles?: { full_name?: string | null } | null;
}): TripUpdate {
  return {
    id: row.id,
    trip_id: row.trip_id,
    actor_id: row.actor_id,
    actor_name: row.profiles?.full_name ?? null,
    event_type: row.event_type,
    message: row.message,
    created_at: row.created_at,
  };
}

export function mapNotification(row: {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string | null;
  read_at?: string | null;
  created_at: string;
}): AppNotification {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    message: row.message,
    link: row.link,
    read_at: row.read_at,
    created_at: row.created_at,
  };
}
