import { FleetDataError } from "@/components/data/fleet-data-error";
import { DashboardModule } from "@/features/dashboard/components/dashboard-module";
import { getDrivers, getTrips, getVehicles } from "@/lib/fleet/queries";

export default async function DashboardPage() {
  const [vehiclesResult, driversResult, tripsResult] = await Promise.all([
    getVehicles(),
    getDrivers(),
    getTrips(),
  ]);

  if (vehiclesResult.error || !vehiclesResult.data) {
    return <FleetDataError message={vehiclesResult.error ?? "Unknown error"} />;
  }

  if (driversResult.error || !driversResult.data) {
    return <FleetDataError message={driversResult.error ?? "Unknown error"} />;
  }

  if (tripsResult.error || !tripsResult.data) {
    return <FleetDataError message={tripsResult.error ?? "Unknown error"} />;
  }

  return (
    <DashboardModule
      vehicles={vehiclesResult.data}
      drivers={driversResult.data}
      trips={tripsResult.data}
    />
  );
}
