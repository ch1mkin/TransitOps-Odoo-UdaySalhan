import { FleetDataError } from "@/components/data/fleet-data-error";
import { DriversModule } from "@/features/drivers/components/drivers-module";
import { canManageDrivers } from "@/lib/fleet/permissions";
import { getDrivers } from "@/lib/fleet/queries";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/constants/roles";
import type { Profile } from "@/types";

export default async function DriversPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single<Pick<Profile, "role">>()
    : { data: null };

  const role = (profile?.role ?? ROLES.FLEET_MANAGER) as Role;
  const result = await getDrivers();

  if (result.error || !result.data) {
    return <FleetDataError message={result.error ?? "Unknown error"} />;
  }

  return (
    <DriversModule drivers={result.data} canCreate={canManageDrivers(role)} />
  );
}
