import { createAdminClient } from "@/lib/supabase/admin";

const MAX_DOC_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadSessionTable = "driver_upload_sessions" | "vehicle_upload_sessions";

interface UploadSessionRow {
  id: string;
  expires_at: string;
  status: string;
}

export function resolveImageMimeType(file: File) {
  if (file.type && ALLOWED_IMAGE_TYPES.has(file.type)) {
    return file.type;
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export function isAllowedImageFile(file: File) {
  const mime = resolveImageMimeType(file);
  return ALLOWED_IMAGE_TYPES.has(mime);
}

export async function uploadProofSessionFile(params: {
  table: UploadSessionTable;
  bucket: string;
  token: string;
  file: File;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const { table, bucket, token, file } = params;

  if (!file || file.size === 0) {
    return { success: false, error: "Please select an image to upload." };
  }

  if (file.size > MAX_DOC_BYTES) {
    return { success: false, error: "File must be 10 MB or smaller." };
  }

  if (!isAllowedImageFile(file)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Mobile upload is not configured on the server." };
  }

  const { data: session, error } = await admin
    .from(table)
    .select("id, expires_at, status")
    .eq("token", token)
    .maybeSingle<UploadSessionRow>();

  if (error || !session) {
    return { success: false, error: "Upload link is invalid or expired." };
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Upload link has expired." };
  }

  if (session.status === "completed") {
    return { success: false, error: "This upload link has already been used." };
  }

  const mimeType = resolveImageMimeType(file);
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const storagePath = `sessions/${session.id}/raw.${extension}`;

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, file, { contentType: mimeType, upsert: true });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error: updateError } = await admin
    .from(table)
    .update({
      status: "uploaded",
      temp_storage_path: storagePath,
      file_name: file.name,
      mime_type: mimeType,
    })
    .eq("id", session.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, id: session.id };
}
