import { FleetDataError } from "@/components/data/fleet-data-error";
import { TripsModule } from "@/features/trips/components/trips-module";
import { canManageTrips } from "@/lib/fleet/permissions";
import { getDrivers, getFleetLabels, getTrips, getVehicles } from "@/lib/fleet/queries";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/constants/roles";
import type { Profile } from "@/types";

export default async function TripsPage() {
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

  const [tripsResult, vehiclesResult, driversResult, labelsResult] =
    await Promise.all([
      getTrips(),
      getVehicles(),
      getDrivers(),
      getFleetLabels(),
    ]);

  if (tripsResult.error || !tripsResult.data) {
    return <FleetDataError message={tripsResult.error ?? "Unknown error"} />;
  }

  if (vehiclesResult.error || !vehiclesResult.data) {
    return <FleetDataError message={vehiclesResult.error ?? "Unknown error"} />;
  }

  if (driversResult.error || !driversResult.data) {
    return <FleetDataError message={driversResult.error ?? "Unknown error"} />;
  }

  if (labelsResult.error || !labelsResult.data) {
    return <FleetDataError message={labelsResult.error ?? "Unknown error"} />;
  }

  return (
    <TripsModule
      trips={tripsResult.data}
      vehicles={vehiclesResult.data}
      drivers={driversResult.data}
      vehicleLabels={labelsResult.data.vehicles}
      driverLabels={labelsResult.data.drivers}
      canCreate={canManageTrips(role)}
    />
  );
}
