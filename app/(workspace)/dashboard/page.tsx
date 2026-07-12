import { FleetDataError } from "@/components/data/fleet-data-error";
import { DashboardModule } from "@/features/dashboard/components/dashboard-module";
import { getPageRole } from "@/lib/fleet/page-role";
import {
  getDrivers,
  getExpenses,
  getFuelLogs,
  getMaintenanceLogs,
  getTrips,
  getVehicles,
} from "@/lib/fleet/queries";

export default async function DashboardPage() {
  const role = await getPageRole();
  const [vehiclesResult, driversResult, tripsResult, fuelResult, expensesResult, maintenanceResult] =
    await Promise.all([
      getVehicles(),
      getDrivers(),
      getTrips(),
      getFuelLogs(),
      getExpenses(),
      getMaintenanceLogs(),
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
      role={role}
      vehicles={vehiclesResult.data}
      drivers={driversResult.data}
      trips={tripsResult.data}
      fuelLogs={fuelResult.data ?? []}
      expenses={expensesResult.data ?? []}
      maintenanceLogs={maintenanceResult.data ?? []}
    />
  );
}
