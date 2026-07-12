import { ROLES, type Role } from "@/constants/roles";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getPageRole(): Promise<Role> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return ROLES.FLEET_MANAGER;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<Pick<Profile, "role">>();

  return (profile?.role ?? ROLES.FLEET_MANAGER) as Role;
}
