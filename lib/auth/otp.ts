import { createHash, randomInt } from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export type OtpPurpose = "login" | "register";

export function generateOtpCode() {
  return String(randomInt(1000, 10000));
}

export function hashOtpCode(code: string, email: string) {
  const secret =
    process.env.OTP_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "transitops-otp-fallback";
  return createHash("sha256").update(`${email.toLowerCase()}:${code}:${secret}`).digest("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
