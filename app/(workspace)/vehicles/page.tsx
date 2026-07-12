import { FleetDataError } from "@/components/data/fleet-data-error";
import { VehiclesModule } from "@/features/vehicles/components/vehicles-module";
import { canManageVehicles } from "@/lib/fleet/permissions";
import { getVehicles } from "@/lib/fleet/queries";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/constants/roles";
import type { Profile } from "@/types";

export default async function VehiclesPage() {
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
  const result = await getVehicles();

  if (result.error || !result.data) {
    return <FleetDataError message={result.error ?? "Unknown error"} />;
  }

  return (
    <VehiclesModule vehicles={result.data} canCreate={canManageVehicles(role)} />
  );
}
