import { createClient } from "@/lib/supabase/server";
import { WorkspaceChrome } from "@/components/workspace/workspace-chrome";
import { ROLES, type Role } from "@/constants/roles";
import type { Profile } from "@/types";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  const role = (profile?.role ?? ROLES.FLEET_MANAGER) as Role;
  const userName = profile?.full_name ?? user.email ?? "User";

  return (
    <WorkspaceChrome role={role} userName={userName} userId={user.id}>
      {children}
    </WorkspaceChrome>
  );
}
