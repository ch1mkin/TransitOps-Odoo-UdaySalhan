"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireSessionRole } from "@/lib/fleet/session";
import { ROLES } from "@/constants/roles";
import type { TripLocation } from "@/types/entities";

export async function getTripLocations(tripId: string): Promise<{
  locations: TripLocation[];
  error?: string;
}> {
  const auth = await requireSessionRole([
    ROLES.DISPATCHER,
    ROLES.FLEET_MANAGER,
    ROLES.FINANCIAL_ANALYST,
    ROLES.SAFETY_OFFICER,
  ]);
  if (!auth.ok) return { locations: [], error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_locations")
    .select("*")
    .eq("trip_id", tripId)
    .order("recorded_at", { ascending: false })
    .limit(50);

  if (error) return { locations: [], error: error.message };

  return {
    locations: (data ?? []).map((row) => ({
      id: row.id,
      trip_id: row.trip_id,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      accuracy: row.accuracy != null ? Number(row.accuracy) : null,
      recorded_at: row.recorded_at,
    })),
  };
}

export async function getTripByTrackingToken(token: string): Promise<{
  valid: boolean;
  tripId?: string;
  tripNumber?: string;
  error?: string;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return { valid: false, error: "Tracking service unavailable." };
  }

  const { data, error } = await admin
    .from("trips")
    .select("id, trip_number, status")
    .eq("tracking_token", token)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, error: "Tracking link is invalid." };
  }

  if (data.status !== "Dispatched") {
    return { valid: false, error: "This trip is not currently in transit." };
  }

  return { valid: true, tripId: data.id, tripNumber: data.trip_number };
}

export async function recordTripLocationByToken(
  token: string,
  latitude: number,
  longitude: number,
  accuracy?: number | null
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Tracking service unavailable." };
  }

  const { data: trip, error } = await admin
    .from("trips")
    .select("id, status")
    .eq("tracking_token", token)
    .maybeSingle();

  if (error || !trip) {
    return { success: false, error: "Tracking link is invalid." };
  }

  if (trip.status !== "Dispatched") {
    return { success: false, error: "Trip is not in transit." };
  }

  const { error: insertError } = await admin.from("trip_locations").insert({
    trip_id: trip.id,
    latitude,
    longitude,
    accuracy: accuracy ?? null,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/trips");
  revalidatePath(`/trips/${trip.id}`);
  return { success: true };
}
