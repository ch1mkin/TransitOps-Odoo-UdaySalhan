"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { DRIVER_DOCS_BUCKET } from "@/constants/driver-documents";
import { canManageDrivers } from "@/lib/fleet/permissions";
import { requireSessionRole } from "@/lib/fleet/session";
import { driverDocumentSchema } from "@/lib/fleet/schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { DriverUploadSession } from "@/types/entities";

type ActionResult =
  | { success: true; id?: string; token?: string; sessionId?: string }
  | { success: false; error: string };

const MAX_DOC_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const SESSION_TTL_MS = 30 * 60 * 1000;

function revalidateDrivers() {
  revalidatePath("/drivers");
  revalidatePath("/license-monitoring");
}

export async function createDriverUploadSession(
  documentType: string
): Promise<ActionResult & { sessionId?: string; token?: string }> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot manage driver documents." };
  }

  if (documentType !== "Driving License" && documentType !== "Aadhaar Card") {
    return { success: false, error: "Invalid document type." };
  }

  const supabase = await createClient();
  const token = crypto.randomUUID().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("driver_upload_sessions")
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

export async function getDriverUploadSession(sessionId: string): Promise<{
  session: DriverUploadSession | null;
  previewUrl: string | null;
  error?: string;
}> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { session: null, previewUrl: null, error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("driver_upload_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle<DriverUploadSession>();

  if (error || !data) {
    return { session: null, previewUrl: null, error: error?.message ?? "Session not found" };
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { session: { ...data, status: "expired" }, previewUrl: null };
  }

  if (!data.temp_storage_path) {
    return { session: data, previewUrl: null };
  }

  const admin = createAdminClient();
  const client = admin ?? supabase;
  const { data: signed, error: signError } = await client.storage
    .from(DRIVER_DOCS_BUCKET)
    .createSignedUrl(data.temp_storage_path, 600);

  if (signError) {
    return { session: data, previewUrl: null, error: signError.message };
  }

  return { session: data, previewUrl: signed.signedUrl };
}

export async function uploadDriverProofByToken(
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
    .from("driver_upload_sessions")
    .select("*")
    .eq("token", token)
    .maybeSingle<DriverUploadSession>();

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
    .from(DRIVER_DOCS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error: updateError } = await admin
    .from("driver_upload_sessions")
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

  return { success: true, id: session.id };
}

export async function uploadDriverDocument(formData: FormData): Promise<ActionResult> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER]);
  if (!auth.ok) return { success: false, error: auth.error };
  if (!canManageDrivers(auth.role)) {
    return { success: false, error: "You cannot manage driver documents." };
  }

  const driverId = String(formData.get("driver_id") ?? "");
  const documentType = String(formData.get("document_type") ?? "");
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please provide a document image." };
  }

  if (file.size > MAX_DOC_BYTES) {
    return { success: false, error: "File must be 10 MB or smaller." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  const parsed = driverDocumentSchema.safeParse({
    driver_id: driverId,
    document_type: documentType,
    file_name: file.name,
    storage_path: "pending",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid document data." };
  }

  const supabase = await createClient();
  const storagePath = `${driverId}/${crypto.randomUUID()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(DRIVER_DOCS_BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data, error } = await supabase
    .from("driver_documents")
    .insert({
      ...parsed.data,
      storage_path: storagePath,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from(DRIVER_DOCS_BUCKET).remove([storagePath]);
    return { success: false, error: error.message };
  }

  revalidateDrivers();
  return { success: true, id: data.id };
}

export async function getDriverDocumentUrl(
  storagePath: string
): Promise<{ url: string | null; error?: string }> {
  const auth = await requireSessionRole([
    ROLES.SAFETY_OFFICER,
    ROLES.FLEET_MANAGER,
    ROLES.DISPATCHER,
    ROLES.FINANCIAL_ANALYST,
  ]);
  if (!auth.ok) return { url: null, error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DRIVER_DOCS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) return { url: null, error: error.message };
  return { url: data.signedUrl };
}

export async function getDriverProofSessionByToken(token: string): Promise<{
  valid: boolean;
  documentType?: string;
  error?: string;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return { valid: false, error: "Upload service unavailable." };
  }

  const { data, error } = await admin
    .from("driver_upload_sessions")
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
