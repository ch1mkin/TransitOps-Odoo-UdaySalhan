import { FleetDataError } from "@/components/data/fleet-data-error";
import { RoiAnalyticsModule } from "@/features/reports/components/roi-analytics-module";
import {
  getExpenses,
  getFuelLogs,
  getTrips,
  getVehicles,
} from "@/lib/fleet/queries";

export default async function RoiReportsPage() {
  const [vehiclesResult, tripsResult, fuelResult, expensesResult] = await Promise.all([
    getVehicles(),
    getTrips(),
    getFuelLogs(),
    getExpenses(),
  ]);

  if (vehiclesResult.error || !vehiclesResult.data) {
    return <FleetDataError message={vehiclesResult.error ?? "Unknown error"} />;
  }
  if (tripsResult.error || !tripsResult.data) {
    return <FleetDataError message={tripsResult.error ?? "Unknown error"} />;
  }

  return (
    <RoiAnalyticsModule
      vehicles={vehiclesResult.data}
      trips={tripsResult.data}
      fuelLogs={fuelResult.data ?? []}
      expenses={expensesResult.data ?? []}
    />
  );
}
