"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapSupabaseAuthError } from "@/lib/supabase/env";
import {
  generateOtpCode,
  hashOtpCode,
  normalizeEmail,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  type OtpPurpose,
} from "@/lib/auth/otp";
import { loginSchema, registerSchema } from "@/schemas/auth";
import { sendOtpEmail } from "@/lib/utils/email";

interface OtpActionResult {
  success: boolean;
  error?: string;
  devCode?: string;
}

async function storeOtp(email: string, purpose: OtpPurpose, code: string) {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, error: "Server configuration error." };
  }

  const normalized = normalizeEmail(email);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await admin
    .from("auth_otp_codes")
    .delete()
    .eq("email", normalized)
    .eq("purpose", purpose);

  const { error } = await admin.from("auth_otp_codes").insert({
    email: normalized,
    purpose,
    code_hash: hashOtpCode(code, normalized),
    expires_at: expiresAt,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}

async function verifyStoredOtp(
  email: string,
  purpose: OtpPurpose,
  code: string
): Promise<OtpActionResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Server configuration error." };
  }

  const normalized = normalizeEmail(email);
  const { data: row, error } = await admin
    .from("auth_otp_codes")
    .select("id, code_hash, attempts, expires_at, consumed_at")
    .eq("email", normalized)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) {
    return { success: false, error: "Verification code expired or not found. Request a new code." };
  }

  if (row.consumed_at) {
    return { success: false, error: "This code has already been used." };
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Verification code expired. Request a new code." };
  }

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { success: false, error: "Too many failed attempts. Request a new code." };
  }

  const isValid = row.code_hash === hashOtpCode(code, normalized);

  if (!isValid) {
    await admin
      .from("auth_otp_codes")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return { success: false, error: "Invalid verification code." };
  }

  await admin
    .from("auth_otp_codes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  return { success: true };
}

async function deliverOtp(email: string, code: string, purpose: OtpPurpose) {
  const result = await sendOtpEmail({ to: email, code, purpose });

  if (result.sent) {
    return { success: true as const };
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`[TransitOps OTP] ${purpose} code for ${email}: ${code}`);
    return { success: true as const, devCode: code };
  }

  return {
    success: false as const,
    error: result.reason ?? "Could not send verification email. Check Resend configuration.",
  };
}

export async function sendLoginOtp(input: {
  email: string;
  password: string;
}): Promise<OtpActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const email = normalizeEmail(parsed.data.email);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: mapSupabaseAuthError(error.message) };
  }

  await supabase.auth.signOut();

  const code = generateOtpCode();
  const stored = await storeOtp(email, "login", code);
  if (!stored.ok) {
    return { success: false, error: stored.error };
  }

  const delivered = await deliverOtp(email, code, "login");
  if (!delivered.success) {
    return { success: false, error: delivered.error };
  }

  return { success: true, devCode: delivered.devCode };
}

export async function verifyLoginOtp(input: {
  email: string;
  password: string;
  code: string;
}): Promise<OtpActionResult> {
  const parsed = loginSchema.safeParse({ email: input.email, password: input.password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  if (!/^\d{4}$/.test(input.code)) {
    return { success: false, error: "Enter the 4-digit verification code." };
  }

  const email = normalizeEmail(parsed.data.email);
  const verified = await verifyStoredOtp(email, "login", input.code);
  if (!verified.success) {
    return verified;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: mapSupabaseAuthError(error.message) };
  }

  return { success: true };
}

export async function sendRegisterOtp(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}): Promise<OtpActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid registration data." };
  }

  const email = normalizeEmail(parsed.data.email);
  const admin = createAdminClient();
  if (!admin) {
    return { success: false, error: "Server configuration error." };
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const code = generateOtpCode();
  const stored = await storeOtp(email, "register", code);
  if (!stored.ok) {
    return { success: false, error: stored.error };
  }

  const delivered = await deliverOtp(email, code, "register");
  if (!delivered.success) {
    return { success: false, error: delivered.error };
  }

  return { success: true, devCode: delivered.devCode };
}

export async function verifyRegisterOtp(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  code: string;
}): Promise<OtpActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid registration data." };
  }

  if (!/^\d{4}$/.test(input.code)) {
    return { success: false, error: "Enter the 4-digit verification code." };
  }

  const email = normalizeEmail(parsed.data.email);
  const verified = await verifyStoredOtp(email, "register", input.code);
  if (!verified.success) {
    return verified;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return { success: false, error: mapSupabaseAuthError(error.message) };
  }

  if (!data.user) {
    return { success: false, error: "Registration failed. Please try again." };
  }

  await supabase.auth.signOut();
  return { success: true };
}
