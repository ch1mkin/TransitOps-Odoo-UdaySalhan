import { FleetDataError } from "@/components/data/fleet-data-error";
import { TripsModule } from "@/features/trips/components/trips-module";
import { getDrivers, getFleetLabels, getTrips, getVehicles } from "@/lib/fleet/queries";

export default async function ActiveTripsPage() {
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
      canCreate={false}
      view="active"
    />
  );
}
