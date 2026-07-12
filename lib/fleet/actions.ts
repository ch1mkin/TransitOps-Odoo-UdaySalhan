"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { lookupCoordinates } from "@/lib/utils/geo";
import {
  canCreateTrips,
  canManageDrivers,
  canManageExpenses,
  canManageFuel,
  canManageMaintenance,
  canManageTripLifecycle,
  canManageVehicleDocuments,
  canManageVehicles,
  canChangeDriverStatus,
  canChangeVehicleStatus,
  canRetireVehicles,
} from "@/lib/fleet/permissions";
import { requireSessionRole } from "@/lib/fleet/session";
import {
  completeTripSchema,
  driverSchema,
  expenseSchema,
  fuelLogSchema,
  maintenanceSchema,
  tripSchema,
  vehicleDocumentSchema,
  vehicleSchema,
  type CompleteTripInput,
  type DriverInput,
  type ExpenseInput,
  type FuelLogInput,
  type MaintenanceInput,
  type TripInput,
  type VehicleDocumentInput,
  type VehicleInput,
} from "@/lib/fleet/schemas";
import {
  assertTripCancellable,
  assertTripCompletable,
  assertTripDispatchable,
  TripValidationError,
} from "@/lib/fleet/trip-lifecycle";
import {
  assertDriverStatusChange,
  assertVehicleStatusChange,
} from "@/lib/fleet/status-rules";
import { mapDriver, mapTrip, mapVehicle } from "@/lib/fleet/mappers";
import {
  notifyTripStakeholders,
  recordTripUpdate,
} from "@/lib/fleet/trip-events";
import type { DriverStatus, VehicleStatus } from "@/types/entities";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/format";

type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues.map((issue) => issue.message).join(", ");
}

function revalidateFleet() {
  revalidatePath("/dashboard");
  revalidatePath("/vehicles");
  revalidatePath("/vehicle-documents");
  revalidatePath("/drivers");
  revalidatePath("/license-monitoring");
  revalidatePath("/trips");
  revalidatePath("/trips/active");
  revalidatePath("/trips/history");
  revalidatePath("/maintenance");
  revalidatePath("/fuel");
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/reports/roi");
}

const VEHICLE_DOCS_BUCKET = "vehicle-documents";
const MAX_DOC_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function createVehicle(input: VehicleInput): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function createDriver(input: DriverInput): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot manage drivers." };
  }

  const parsed = driverSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drivers")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function createTrip(input: TripInput): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.DISPATCHER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canCreateTrips(auth.role)) {
    return { success: false, error: "You cannot create trips." };
  }

  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .insert({
      ...parsed.data,
      dispatch_time:
        parsed.data.status === "Dispatched" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await recordTripUpdate(supabase, {
    tripId: data.id,
    actorId: auth.user.id,
    eventType: "created",
    message: `Trip ${parsed.data.trip_number} created as ${parsed.data.status}.`,
  });

  await notifyTripStakeholders(supabase, {
    tripNumber: parsed.data.trip_number,
    tripId: data.id,
    title: "New trip created",
    message: `${parsed.data.trip_number}: ${parsed.data.source} → ${parsed.data.destination}`,
    excludeUserId: auth.user.id,
  });

  revalidateFleet();
  return { success: true, id: data.id };
}

async function loadTripBundle(tripId: string) {
  const supabase = await createClient();
  const { data: tripRow, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .maybeSingle();

  if (tripError || !tripRow) {
    throw new TripValidationError("Trip not found.");
  }

  const trip = mapTrip(tripRow);

  const [{ data: vehicleRow }, { data: driverRow }] = await Promise.all([
    supabase.from("vehicles").select("*").eq("id", trip.vehicle_id).maybeSingle(),
    supabase.from("drivers").select("*").eq("id", trip.driver_id).maybeSingle(),
  ]);

  if (!vehicleRow || !driverRow) {
    throw new TripValidationError("Trip vehicle or driver not found.");
  }

  return {
    trip,
    vehicle: mapVehicle(vehicleRow),
    driver: mapDriver(driverRow),
  };
}

export async function dispatchTrip(tripId: string): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.DISPATCHER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageTripLifecycle(auth.role)) {
    return { success: false, error: "Only dispatchers can dispatch trips." };
  }

  try {
    const { trip, vehicle, driver } = await loadTripBundle(tripId);
    assertTripDispatchable(trip, vehicle, driver);

    const supabase = await createClient();
    const now = new Date().toISOString();
    const trackingToken = crypto.randomUUID().replace(/-/g, "");
    const sourceCoords = lookupCoordinates(trip.source);

    const { error: tripError } = await supabase
      .from("trips")
      .update({
        status: "Dispatched",
        dispatch_time: now,
        tracking_token: trackingToken,
      })
      .eq("id", tripId);

    if (tripError) return { success: false, error: tripError.message };

    await supabase.from("trip_locations").insert({
      trip_id: tripId,
      latitude: sourceCoords.lat,
      longitude: sourceCoords.lng,
    });

    await supabase.from("vehicles").update({ status: "On Trip" }).eq("id", vehicle.id);
    await supabase.from("drivers").update({ status: "On Trip" }).eq("id", driver.id);

    await recordTripUpdate(supabase, {
      tripId,
      actorId: auth.user.id,
      eventType: "dispatched",
      message: `Trip ${trip.trip_number} dispatched.`,
    });

    await notifyTripStakeholders(supabase, {
      tripNumber: trip.trip_number,
      tripId,
      title: "Trip dispatched",
      message: `${trip.trip_number} is now in transit.`,
      excludeUserId: auth.user.id,
    });

    revalidateFleet();
    return { success: true, id: tripId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof TripValidationError ? error.message : "Dispatch failed.",
    };
  }
}

export async function completeTrip(
  tripId: string,
  input: CompleteTripInput
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.DISPATCHER]);
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = completeTripSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  try {
    const { trip, vehicle, driver } = await loadTripBundle(tripId);
    assertTripCompletable(trip);

    const supabase = await createClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("trips")
      .update({
        status: "Completed",
        completion_time: now,
        actual_distance: parsed.data.actual_distance,
        fuel_used: parsed.data.fuel_used,
        revenue: parsed.data.revenue,
      })
      .eq("id", tripId);

    if (error) return { success: false, error: error.message };

    if (parsed.data.closing_odometer < vehicle.odometer) {
      return {
        success: false,
        error: `Closing odometer must be at least ${vehicle.odometer} km.`,
      };
    }

    await supabase
      .from("vehicles")
      .update({ status: "Available", odometer: parsed.data.closing_odometer })
      .eq("id", vehicle.id);
    await supabase.from("drivers").update({ status: "Available" }).eq("id", driver.id);

    await recordTripUpdate(supabase, {
      tripId,
      actorId: auth.user.id,
      eventType: "completed",
      message: `Trip ${trip.trip_number} completed — ${parsed.data.actual_distance} km, odometer ${parsed.data.closing_odometer} km, ${formatCurrency(parsed.data.revenue)} revenue.`,
    });

    await notifyTripStakeholders(supabase, {
      tripNumber: trip.trip_number,
      tripId,
      title: "Trip completed",
      message: `${trip.trip_number} has been marked complete.`,
      excludeUserId: auth.user.id,
    });

    revalidateFleet();
    return { success: true, id: tripId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof TripValidationError ? error.message : "Complete failed.",
    };
  }
}

export async function cancelTrip(tripId: string): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.DISPATCHER]);
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const { trip, vehicle, driver } = await loadTripBundle(tripId);
    assertTripCancellable(trip);

    const supabase = await createClient();
    const { error } = await supabase
      .from("trips")
      .update({ status: "Cancelled" })
      .eq("id", tripId);

    if (error) return { success: false, error: error.message };

    if (trip.status === "Dispatched") {
      await supabase.from("vehicles").update({ status: "Available" }).eq("id", vehicle.id);
      await supabase.from("drivers").update({ status: "Available" }).eq("id", driver.id);
    }

    await recordTripUpdate(supabase, {
      tripId,
      actorId: auth.user.id,
      eventType: "cancelled",
      message: `Trip ${trip.trip_number} cancelled.`,
    });

    await notifyTripStakeholders(supabase, {
      tripNumber: trip.trip_number,
      tripId,
      title: "Trip cancelled",
      message: `${trip.trip_number} was cancelled.`,
      excludeUserId: auth.user.id,
    });

    revalidateFleet();
    return { success: true, id: tripId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof TripValidationError ? error.message : "Cancel failed.",
    };
  }
}

// Re-export permission helpers used by pages (tree-shake friendly)
export { canManageDrivers, canManageVehicles };

export async function updateVehicle(
  id: string,
  input: VehicleInput
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageVehicles(auth.role)) {
    return { success: false, error: "You cannot edit vehicles." };
  }

  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update(parsed.data).eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id };
}

export async function retireVehicle(id: string): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canRetireVehicles(auth.role)) {
    return { success: false, error: "You cannot retire vehicles." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ status: "Retired" })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id };
}

export async function updateDriver(
  id: string,
  input: DriverInput
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot manage drivers." };
  }

  const parsed = driverSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("drivers").update(parsed.data).eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id };
}

export async function updateVehicleStatus(
  id: string,
  status: VehicleStatus
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canChangeVehicleStatus(auth.role)) {
    return { success: false, error: "You cannot change vehicle status." };
  }

  const supabase = await createClient();
  const { data: vehicle, error: fetchError } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !vehicle) {
    return { success: false, error: fetchError?.message ?? "Vehicle not found." };
  }

  try {
    assertVehicleStatusChange(vehicle.status as VehicleStatus, status);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid status change.",
    };
  }

  const { error } = await supabase.from("vehicles").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id };
}

export async function updateDriverStatus(
  id: string,
  status: DriverStatus
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canChangeDriverStatus(auth.role)) {
    return { success: false, error: "You cannot change driver status." };
  }

  const supabase = await createClient();
  const { data: driver, error: fetchError } = await supabase
    .from("drivers")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !driver) {
    return { success: false, error: fetchError?.message ?? "Driver not found." };
  }

  try {
    assertDriverStatusChange(driver.status as DriverStatus, status);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid status change.",
    };
  }

  const { error } = await supabase.from("drivers").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id };
}

/** @deprecated Use updateDriverStatus */
export async function setDriverStatus(
  id: string,
  status: "Available" | "Suspended"
): Promise<ActionResult> {
  return updateDriverStatus(id, status);
}

export async function createMaintenance(
  input: MaintenanceInput
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageMaintenance(auth.role)) {
    return { success: false, error: "You cannot schedule maintenance." };
  }

  const parsed = maintenanceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("maintenance_logs")
    .insert({
      ...parsed.data,
      status: "In Progress",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await supabase
    .from("vehicles")
    .update({ status: "In Shop" })
    .eq("id", parsed.data.vehicle_id);

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function closeMaintenance(id: string): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageMaintenance(auth.role)) {
    return { success: false, error: "You cannot close maintenance." };
  }

  const supabase = await createClient();
  const { data: log, error: fetchError } = await supabase
    .from("maintenance_logs")
    .select("vehicle_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !log) {
    return { success: false, error: fetchError?.message ?? "Maintenance log not found." };
  }

  if (log.status === "Completed") {
    return { success: false, error: "Maintenance is already closed." };
  }

  const now = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("maintenance_logs")
    .update({ status: "Completed", closed_at: now })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("status")
    .eq("id", log.vehicle_id)
    .maybeSingle();

  if (vehicle && vehicle.status !== "Retired") {
    await supabase
      .from("vehicles")
      .update({ status: "Available" })
      .eq("id", log.vehicle_id);
  }

  revalidateFleet();
  return { success: true, id };
}

export async function createFuelLog(input: FuelLogInput): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FINANCIAL_ANALYST]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageFuel(auth.role)) {
    return { success: false, error: "You cannot record fuel logs." };
  }

  const parsed = fuelLogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fuel_logs")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function createExpense(input: ExpenseInput): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FINANCIAL_ANALYST]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageExpenses(auth.role)) {
    return { success: false, error: "You cannot record expenses." };
  }

  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function createVehicleDocument(
  input: VehicleDocumentInput
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageVehicleDocuments(auth.role)) {
    return { success: false, error: "You cannot manage vehicle documents." };
  }

  const parsed = vehicleDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_documents")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function uploadVehicleDocument(
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageVehicleDocuments(auth.role)) {
    return { success: false, error: "You cannot manage vehicle documents." };
  }

  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const documentType = String(formData.get("document_type") ?? "");
  const expiryDate = String(formData.get("expiry_date") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select a file to upload." };
  }

  if (file.size > MAX_DOC_BYTES) {
    return { success: false, error: "File must be 10 MB or smaller." };
  }

  if (!ALLOWED_DOC_TYPES.has(file.type)) {
    return { success: false, error: "Only PDF and image files are allowed." };
  }

  const parsed = vehicleDocumentSchema.safeParse({
    vehicle_id: vehicleId,
    document_type: documentType,
    file_name: file.name,
    expiry_date: expiryDate,
    notes,
    storage_path: null,
  });

  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const supabase = await createClient();
  const storagePath = `${vehicleId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(VEHICLE_DOCS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data, error } = await supabase
    .from("vehicle_documents")
    .insert({
      ...parsed.data,
      storage_path: storagePath,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from(VEHICLE_DOCS_BUCKET).remove([storagePath]);
    return { success: false, error: error.message };
  }

  revalidateFleet();
  return { success: true, id: data.id };
}

export async function getVehicleDocumentUrl(
  storagePath: string
): Promise<{ url: string | null; error?: string }> {
  const auth = await requireSessionRole([
    ROLES.FLEET_MANAGER,
    ROLES.DISPATCHER,
    ROLES.SAFETY_OFFICER,
    ROLES.FINANCIAL_ANALYST,
  ]);
  if (!auth.ok) return { url: null, error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(VEHICLE_DOCS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl };
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const auth = await requireSessionRole([
    ROLES.FLEET_MANAGER,
    ROLES.DISPATCHER,
    ROLES.SAFETY_OFFICER,
    ROLES.FINANCIAL_ANALYST,
  ]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) return { success: false, error: error.message };
  return { success: true, id };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const auth = await requireSessionRole([
    ROLES.FLEET_MANAGER,
    ROLES.DISPATCHER,
    ROLES.SAFETY_OFFICER,
    ROLES.FINANCIAL_ANALYST,
  ]);
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", auth.user.id)
    .is("read_at", null);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
