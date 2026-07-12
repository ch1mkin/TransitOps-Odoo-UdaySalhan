const PLACEHOLDER_ONLY_PATTERNS = [
  /^your_supabase_anon_key$/i,
  /^your[_-]?supabase[_-]?anon[_-]?key$/i,
  /^paste-your-anon-key-here$/i,
  /^paste-rest-of-anon-key-here$/i,
  /^replace[_-]?me$/i,
];

function sanitizeAnonKey(raw: string): string {
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");

  if (trimmed.startsWith("eyJ")) {
    return trimmed;
  }

  const jwtStart = trimmed.indexOf("eyJ");
  if (jwtStart > 0) {
    return trimmed.slice(jwtStart);
  }

  return trimmed;
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

function decodeJwtPayload(token: string): { role?: string } {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("JWT must contain header, payload, and signature");
  }

  return JSON.parse(decodeBase64Url(parts[1])) as { role?: string };
}

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function normalizeSupabaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function validateSupabaseEnv(): SupabaseEnv {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is missing. Copy your Project URL from Supabase → Project Settings → API."
    );
  }

  if (!rawAnonKey?.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Copy the anon public key from Supabase → Project Settings → API."
    );
  }

  const url = normalizeSupabaseUrl(rawUrl);
  const anonKey = sanitizeAnonKey(rawAnonKey);

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must look like https://your-project-id.supabase.co (no trailing slash)."
    );
  }

  if (PLACEHOLDER_ONLY_PATTERNS.some((pattern) => pattern.test(anonKey))) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY still contains placeholder text. Paste the real anon JWT from Supabase → Project Settings → API → Project API keys → anon public."
    );
  }

  if (!anonKey.startsWith("eyJ")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY must be the anon public JWT (starts with eyJ). Do not paste the service_role key or the variable name from .env.example."
    );
  }

  if (anonKey.split(".").length !== 3) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY looks incomplete. Copy the full anon JWT from Supabase (three dot-separated parts)."
    );
  }

  try {
    const payload = decodeJwtPayload(anonKey);

    if (payload.role === "service_role") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY is set to the service_role key. Use the anon public key for the browser client."
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("service_role")) {
      throw error;
    }
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is not a valid Supabase JWT. Copy the anon public key again from the Supabase dashboard."
    );
  }

  return { url, anonKey };
}

export function getSupabaseEnv(): SupabaseEnv {
  return validateSupabaseEnv();
}

export function getSupabaseEnvErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Supabase environment variables are not configured correctly.";
}

export function mapSupabaseAuthError(message: string): string {
  if (/invalid api key/i.test(message)) {
    return "Invalid Supabase API key. Open Supabase → Project Settings → API and paste the anon public JWT into NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart npm run dev.";
  }
  return message;
}
