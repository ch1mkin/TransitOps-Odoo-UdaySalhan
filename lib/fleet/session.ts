import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/constants/roles";
import type { Profile } from "@/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, role: null as Role | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const role = (profile?.role ?? ROLES.FLEET_MANAGER) as Role;

  return { user, profile, role };
}

export async function requireSessionRole(allowed: Role[]) {
  const { user, profile, role } = await getSessionProfile();

  if (!user || !role) {
    return { ok: false as const, error: "You must be signed in." };
  }

  if (!allowed.includes(role)) {
    return { ok: false as const, error: "You do not have permission for this action." };
  }

  return { ok: true as const, user, profile, role };
}
