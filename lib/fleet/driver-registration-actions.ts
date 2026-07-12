"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { DRIVER_DOCS_BUCKET } from "@/constants/driver-documents";
import { canManageDrivers } from "@/lib/fleet/permissions";
import { notifyByRoles } from "@/lib/fleet/trip-events";
import { driverSelfRegistrationSchema } from "@/lib/fleet/schemas";
import { requireSessionRole } from "@/lib/fleet/session";
import { isAllowedImageFile, resolveImageMimeType } from "@/lib/fleet/proof-upload-core";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  sendDriverRegistrationThanksEmail,
} from "@/lib/utils/email";

type ActionResult =
  | { success: true; id?: string; token?: string; url?: string }
  | { success: false; error: string };

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DOC_BYTES = 10 * 1024 * 1024;

function revalidateDrivers() {
  revalidatePath("/drivers");
  revalidatePath("/license-monitoring");
}

function buildRegistrationUrl(token: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return `${configured}/register/driver/${token}`;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/register/driver/${token}`;
  }

  return `http://localhost:3000/register/driver/${token}`;
}

export async function createDriverRegistrationInvite(): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot invite drivers." };
  }

  const supabase = await createClient();
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("driver_registration_invites")
    .insert({
      token,
      created_by: auth.user.id,
      status: "waiting",
      expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    id: data.id,
    token: data.token,
    url: buildRegistrationUrl(data.token),
  };
}

export async function getDriverRegistrationInviteByToken(token: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return { valid: false, error: "Registration service unavailable." };
  }

  const { data, error } = await admin
    .from("driver_registration_invites")
    .select("status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, error: "Registration link is invalid." };
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { valid: false, error: "Registration link has expired." };
  }

  if (data.status !== "waiting") {
    return {
      valid: false,
      error:
        data.status === "submitted"
          ? "This registration has already been submitted."
          : "This registration link is no longer available.",
    };
  }

  return { valid: true };
}

export async function submitDriverSelfRegistration(
  token: string,
  formData: FormData
): Promise<ActionResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Registration service is not configured." };
  }

  const { data: invite, error: inviteError } = await admin
    .from("driver_registration_invites")
    .select("id, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (inviteError || !invite) {
    return { success: false, error: "Registration link is invalid." };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Registration link has expired." };
  }

  if (invite.status !== "waiting") {
    return { success: false, error: "This registration link has already been used." };
  }

  const parsed = driverSelfRegistrationSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    license_number: String(formData.get("license_number") ?? "").trim(),
    license_category: String(formData.get("license_category") ?? ""),
    license_expiry: String(formData.get("license_expiry") ?? ""),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid form data.",
    };
  }

  const file = formData.get("identity_proof");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please upload your driving license or Aadhaar card." };
  }

  if (file.size > MAX_DOC_BYTES) {
    return { success: false, error: "Identity document must be 10 MB or smaller." };
  }

  if (!isAllowedImageFile(file)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  const documentType = String(formData.get("document_type") ?? "Driving License");
  if (documentType !== "Driving License" && documentType !== "Aadhaar Card") {
    return { success: false, error: "Invalid document type." };
  }

  const { data: existingDriver } = await admin
    .from("drivers")
    .select("id")
    .eq("license_number", parsed.data.license_number)
    .maybeSingle();

  if (existingDriver) {
    return { success: false, error: "A driver with this license number already exists." };
  }

  const now = new Date().toISOString();

  const { data: driver, error: driverError } = await admin
    .from("drivers")
    .insert({
      ...parsed.data,
      safety_score: 80,
      status: "Pending Approval",
      registration_source: "self",
      submitted_at: now,
    })
    .select("id, name, email")
    .single();

  if (driverError || !driver) {
    return { success: false, error: driverError?.message ?? "Could not save driver profile." };
  }

  const mimeType = resolveImageMimeType(file);
  const storagePath = `${driver.id}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await admin.storage
    .from(DRIVER_DOCS_BUCKET)
    .upload(storagePath, file, { contentType: mimeType, upsert: false });

  if (uploadError) {
    await admin.from("drivers").delete().eq("id", driver.id);
    return { success: false, error: uploadError.message };
  }

  const { error: documentError } = await admin.from("driver_documents").insert({
    driver_id: driver.id,
    document_type: documentType,
    file_name: file.name,
    storage_path: storagePath,
  });

  if (documentError) {
    await admin.storage.from(DRIVER_DOCS_BUCKET).remove([storagePath]);
    await admin.from("drivers").delete().eq("id", driver.id);
    return { success: false, error: documentError.message };
  }

  const { error: inviteUpdateError } = await admin
    .from("driver_registration_invites")
    .update({
      status: "submitted",
      driver_id: driver.id,
      submitted_at: now,
    })
    .eq("id", invite.id);

  if (inviteUpdateError) {
    return { success: false, error: inviteUpdateError.message };
  }

  await sendDriverRegistrationThanksEmail({
    to: driver.email,
    name: driver.name,
  });

  const supabase = await createClient();
  await notifyByRoles(supabase, {
    roles: [ROLES.SAFETY_OFFICER],
    title: "Driver registration pending approval",
    message: `${driver.name} submitted their driver profile for review.`,
    link: `/drivers/${driver.id}`,
  });

  revalidateDrivers();
  return { success: true, id: driver.id };
}

export async function approveDriverRegistration(driverId: string): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot approve driver registrations." };
  }

  const supabase = await createClient();
  const { data: driver, error: fetchError } = await supabase
    .from("drivers")
    .select("id, status, name")
    .eq("id", driverId)
    .maybeSingle();

  if (fetchError || !driver) {
    return { success: false, error: fetchError?.message ?? "Driver not found." };
  }

  if (driver.status !== "Pending Approval") {
    return { success: false, error: "Only pending registrations can be approved." };
  }

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("drivers")
    .update({
      status: "Available",
      approved_at: now,
      approved_by: auth.user.id,
    })
    .eq("id", driverId);

  if (updateError) return { success: false, error: updateError.message };

  await supabase
    .from("driver_registration_invites")
    .update({
      status: "approved",
      reviewed_by: auth.user.id,
      reviewed_at: now,
    })
    .eq("driver_id", driverId);

  revalidateDrivers();
  revalidatePath(`/drivers/${driverId}`);
  return { success: true, id: driverId };
}

export async function rejectDriverRegistration(
  driverId: string,
  reason?: string
): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot reject driver registrations." };
  }

  const supabase = await createClient();
  const { data: driver, error: fetchError } = await supabase
    .from("drivers")
    .select("id, status")
    .eq("id", driverId)
    .maybeSingle();

  if (fetchError || !driver) {
    return { success: false, error: fetchError?.message ?? "Driver not found." };
  }

  if (driver.status !== "Pending Approval") {
    return { success: false, error: "Only pending registrations can be rejected." };
  }

  const now = new Date().toISOString();
  const trimmedReason = reason?.trim() || "Registration did not meet requirements.";

  await supabase
    .from("driver_registration_invites")
    .update({
      status: "rejected",
      reviewed_by: auth.user.id,
      reviewed_at: now,
      rejection_reason: trimmedReason,
      driver_id: null,
    })
    .eq("driver_id", driverId);

  const { error: deleteError } = await supabase.from("drivers").delete().eq("id", driverId);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidateDrivers();
  revalidatePath(`/drivers/${driverId}`);
  return { success: true, id: driverId };
}
