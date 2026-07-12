"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  driverSchema,
  tripSchema,
  vehicleSchema,
  type DriverInput,
  type TripInput,
  type VehicleInput,
} from "@/lib/fleet/schemas";

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues.map((issue) => issue.message).join(", ");
}

export async function createVehicle(
  input: VehicleInput
): Promise<ActionResult> {
  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/vehicles");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function createDriver(input: DriverInput): Promise<ActionResult> {
  const parsed = driverSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("drivers")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/drivers");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}

export async function createTrip(input: TripInput): Promise<ActionResult> {
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({
      ...parsed.data,
      dispatch_time:
        parsed.data.status === "Dispatched" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/trips");
  revalidatePath("/dashboard");
  return { success: true, id: data.id };
}
