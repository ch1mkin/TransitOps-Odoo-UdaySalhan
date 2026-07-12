import { createClient } from "@/lib/supabase/server";
import {
  mapDriver,
  mapDriverDocument,
  mapExpense,
  mapFuelLog,
  mapMaintenance,
  mapNotification,
  mapTrip,
  mapTripUpdate,
  mapVehicle,
  mapVehicleDocument,
} from "@/lib/fleet/mappers";
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

export type FleetQueryResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

async function getSupabase() {
  return createClient();
}

export async function getVehicles(): Promise<FleetQueryResult<Vehicle[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("registration_number");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []).map(mapVehicle), error: null };
}

export async function getVehicleById(
  id: string
): Promise<FleetQueryResult<Vehicle>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Vehicle not found" };
  }

  return { data: mapVehicle(data), error: null };
}

export async function getDrivers(): Promise<FleetQueryResult<Driver[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .order("name");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []).map(mapDriver), error: null };
}

export async function getDriverById(
  id: string
): Promise<FleetQueryResult<Driver>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Driver not found" };
  }

  return { data: mapDriver(data), error: null };
}

export async function getTrips(): Promise<FleetQueryResult<Trip[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("trip_number", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data ?? []).map(mapTrip), error: null };
}

export async function getTripById(
  id: string
): Promise<FleetQueryResult<Trip>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: "Trip not found" };
  }

  return { data: mapTrip(data), error: null };
}

export async function getFleetLabels(): Promise<
  FleetQueryResult<{
    vehicles: Record<string, string>;
    drivers: Record<string, string>;
  }>
> {
  const [vehiclesResult, driversResult] = await Promise.all([
    getVehicles(),
    getDrivers(),
  ]);

  if (vehiclesResult.error || !vehiclesResult.data) {
    return { data: null, error: vehiclesResult.error ?? "Failed to load vehicles" };
  }

  if (driversResult.error || !driversResult.data) {
    return { data: null, error: driversResult.error ?? "Failed to load drivers" };
  }

  const vehicles = Object.fromEntries(
    vehiclesResult.data.map((v) => [v.id, v.registration_number])
  );
  const drivers = Object.fromEntries(
    driversResult.data.map((d) => [d.id, d.name])
  );

  return { data: { vehicles, drivers }, error: null };
}

export async function getMaintenanceLogs(): Promise<FleetQueryResult<MaintenanceLog[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("*")
    .order("opened_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapMaintenance), error: null };
}

export async function getFuelLogs(): Promise<FleetQueryResult<FuelLog[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("fuel_logs")
    .select("*")
    .order("date", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapFuelLog), error: null };
}

export async function getExpenses(): Promise<FleetQueryResult<ExpenseLog[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapExpense), error: null };
}

export async function getVehicleDocuments(): Promise<FleetQueryResult<VehicleDocument[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("vehicle_documents")
    .select("*")
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapVehicleDocument), error: null };
}

export async function getDriverDocuments(
  driverId: string
): Promise<FleetQueryResult<DriverDocument[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("driver_documents")
    .select("*")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapDriverDocument), error: null };
}

export async function getTripUpdates(
  tripId: string
): Promise<FleetQueryResult<TripUpdate[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("trip_updates")
    .select("*, profiles(full_name)")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapTripUpdate), error: null };
}

export async function getNotifications(
  userId: string
): Promise<FleetQueryResult<AppNotification[]>> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(mapNotification), error: null };
}
