"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { VEHICLE_PHOTOS_BUCKET } from "@/constants/vehicle-documents";
import { canManageVehicles } from "@/lib/fleet/permissions";
import { requireSessionRole } from "@/lib/fleet/session";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { success: false; error: string };

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function revalidateVehicles() {
  revalidatePath("/vehicles");
  revalidatePath("/vehicle-documents");
}

export async function uploadVehiclePhoto(
  vehicleId: string,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageVehicles(auth.role)) {
    return { success: false, error: "You cannot manage vehicles." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please provide a vehicle photo." };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, error: "Photo must be 10 MB or smaller." };
  }

  const supabase = await createClient();
  const storagePath = `${vehicleId}/${crypto.randomUUID()}-vehicle-photo.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(VEHICLE_PHOTOS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error } = await supabase
    .from("vehicles")
    .update({ photo_storage_path: storagePath })
    .eq("id", vehicleId);

  if (error) {
    await supabase.storage.from(VEHICLE_PHOTOS_BUCKET).remove([storagePath]);
    return { success: false, error: error.message };
  }

  revalidateVehicles();
  return { success: true };
}

export async function getVehiclePhotoUrl(
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
    .from(VEHICLE_PHOTOS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl };
}
