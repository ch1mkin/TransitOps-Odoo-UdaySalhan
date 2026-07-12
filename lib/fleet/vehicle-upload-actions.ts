"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { VEHICLE_DOCS_BUCKET, VEHICLE_DOCUMENT_TYPES } from "@/constants/vehicle-documents";
import { canManageVehicleDocuments } from "@/lib/fleet/permissions";
import { requireSessionRole } from "@/lib/fleet/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { VehicleUploadSession } from "@/types/entities";

type ActionResult =
  | { success: true; id?: string; token?: string; sessionId?: string }
  | { success: false; error: string };

const MAX_DOC_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const SESSION_TTL_MS = 30 * 60 * 1000;

function revalidateVehicleDocuments() {
  revalidatePath("/vehicle-documents");
  revalidatePath("/vehicles");
}

function isValidVehicleDocumentType(value: string) {
  return (VEHICLE_DOCUMENT_TYPES as readonly string[]).includes(value);
}

export async function createVehicleUploadSession(
  documentType: string
): Promise<ActionResult & { sessionId?: string; token?: string }> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageVehicleDocuments(auth.role)) {
    return { success: false, error: "You cannot manage vehicle documents." };
  }

  if (!isValidVehicleDocumentType(documentType)) {
    return { success: false, error: "Invalid document type." };
  }

  const supabase = await createClient();
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("vehicle_upload_sessions")
    .insert({
      token,
      created_by: auth.user.id,
      document_type: documentType,
      status: "waiting",
      expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error) return { success: false, error: error.message };

  return { success: true, sessionId: data.id, token: data.token };
}

export async function getVehicleUploadSession(sessionId: string): Promise<{
  session: VehicleUploadSession | null;
  error?: string;
}> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { session: null, error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_upload_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle<VehicleUploadSession>();

  if (error || !data) {
    return { session: null, error: error?.message ?? "Session not found" };
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { session: { ...data, status: "expired" } };
  }

  return { session: data };
}

export async function fetchVehicleUploadSessionImage(sessionId: string): Promise<{
  base64: string | null;
  mimeType: string | null;
  error?: string;
}> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return { base64: null, mimeType: null, error: auth.error };

  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from("vehicle_upload_sessions")
    .select("temp_storage_path, mime_type, status")
    .eq("id", sessionId)
    .maybeSingle<Pick<VehicleUploadSession, "temp_storage_path" | "mime_type" | "status">>();

  if (error || !session?.temp_storage_path || session.status !== "uploaded") {
    return {
      base64: null,
      mimeType: null,
      error: error?.message ?? "Upload not ready yet.",
    };
  }

  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: file, error: downloadError } = await client.storage
    .from(VEHICLE_DOCS_BUCKET)
    .download(session.temp_storage_path);

  if (downloadError || !file) {
    return { base64: null, mimeType: null, error: downloadError?.message ?? "Could not load image." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    base64: buffer.toString("base64"),
    mimeType: session.mime_type || file.type || "image/jpeg",
  };
}

export async function completeVehicleUploadSession(sessionId: string): Promise<void> {
  const auth = await requireSessionRole([ROLES.FLEET_MANAGER]);
  if (!auth.ok) return;

  const supabase = await createClient();
  await supabase
    .from("vehicle_upload_sessions")
    .update({ status: "completed" })
    .eq("id", sessionId);
}

export async function uploadVehicleProofByToken(
  token: string,
  formData: FormData
): Promise<ActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select an image to upload." };
  }

  if (file.size > MAX_DOC_BYTES) {
    return { success: false, error: "File must be 10 MB or smaller." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Mobile upload is not configured on the server." };
  }

  const { data: session, error } = await admin
    .from("vehicle_upload_sessions")
    .select("*")
    .eq("token", token)
    .maybeSingle<VehicleUploadSession>();

  if (error || !session) {
    return { success: false, error: "Upload link is invalid or expired." };
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Upload link has expired." };
  }

  if (session.status === "completed") {
    return { success: false, error: "This upload link has already been used." };
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `sessions/${session.id}/raw.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(VEHICLE_DOCS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error: updateError } = await admin
    .from("vehicle_upload_sessions")
    .update({
      status: "uploaded",
      temp_storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
    })
    .eq("id", session.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidateVehicleDocuments();
  return { success: true, id: session.id };
}

export async function getVehicleProofSessionByToken(token: string): Promise<{
  valid: boolean;
  documentType?: string;
  error?: string;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return { valid: false, error: "Upload service unavailable." };
  }

  const { data, error } = await admin
    .from("vehicle_upload_sessions")
    .select("document_type, expires_at, status")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, error: "Upload link is invalid." };
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { valid: false, error: "Upload link has expired." };
  }

  if (data.status === "completed") {
    return { valid: false, error: "This upload link has already been used." };
  }

  return { valid: true, documentType: data.document_type };
}
