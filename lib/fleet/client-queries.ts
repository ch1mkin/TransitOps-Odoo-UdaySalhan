import { createClient } from "@/lib/supabase/client";
import { mapDriver, mapTrip, mapVehicle } from "@/lib/fleet/mappers";
import type { Driver, Trip, Vehicle } from "@/types/entities";

export async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapVehicle(data);
}

export async function fetchDriverById(id: string): Promise<Driver | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapDriver(data);
}

export async function fetchTripById(id: string): Promise<Trip | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapTrip(data);
}

export async function fetchFleetLabels() {
  const supabase = createClient();

  const [{ data: vehicles }, { data: drivers }] = await Promise.all([
    supabase.from("vehicles").select("id, registration_number"),
    supabase.from("drivers").select("id, name"),
  ]);

  return {
    vehicles: Object.fromEntries(
      (vehicles ?? []).map((v) => [v.id, v.registration_number])
    ),
    drivers: Object.fromEntries((drivers ?? []).map((d) => [d.id, d.name])),
  };
}

export async function fetchWorkspaceTabTitle(href: string): Promise<string | null> {
  const base = href.split("?")[0];

  if (base === "/profile") {
    return null;
  }

  const match = base.match(/^\/(vehicles|drivers|trips)\/([^/]+)$/);
  if (!match) {
    return null;
  }

  const [, segment, id] = match;

  if (segment === "vehicles") {
    const vehicle = await fetchVehicleById(id);
    return vehicle?.registration_number ?? null;
  }

  if (segment === "drivers") {
    const driver = await fetchDriverById(id);
    return driver?.name ?? null;
  }

  if (segment === "trips") {
    const trip = await fetchTripById(id);
    return trip?.trip_number ?? null;
  }

  return null;
}
