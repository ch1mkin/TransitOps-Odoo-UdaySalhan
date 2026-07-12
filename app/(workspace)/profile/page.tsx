import { createClient } from "@/lib/supabase/server";
import { ProfileTabModule } from "@/features/profile/components/profile-tab-module";
import { ROLES, type Role } from "@/constants/roles";
import type { Profile } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const role = (profile?.role ?? ROLES.FLEET_MANAGER) as Role;
  const userName = profile?.full_name ?? user.email ?? "User";

  return (
    <ProfileTabModule
      profile={profile}
      userName={userName}
      role={role}
      userId={user.id}
    />
  );
}
