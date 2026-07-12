import { FleetDataError } from "@/components/data/fleet-data-error";
import { TripsModule } from "@/features/trips/components/trips-module";
import { canCreateTrips } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getDrivers, getFleetLabels, getTrips, getVehicles } from "@/lib/fleet/queries";

async function loadTripsPage(view: "create" | "active" | "history") {
  const role = await getPageRole();
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
      canCreate={canCreateTrips(role) && view === "create"}
      view={view}
    />
  );
}

export default async function TripsPage() {
  return loadTripsPage("create");
}
