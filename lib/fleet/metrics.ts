import type { Driver, FuelLog, Trip } from "@/types/entities";

export function computeAverageFuelEfficiency(trips: Trip[], fuelLogs: FuelLog[]): number {
  const completed = trips.filter((t) => t.status === "Completed");
  const totalDistance = completed.reduce(
    (sum, t) => sum + (t.actual_distance ?? t.planned_distance),
    0
  );

  const tripFuel = completed.reduce((sum, t) => sum + (t.fuel_used ?? 0), 0);
  const totalFuel =
    tripFuel > 0 ? tripFuel : fuelLogs.reduce((sum, log) => sum + log.liters, 0);

  if (totalFuel <= 0 || totalDistance <= 0) return 0;
  return Math.round((totalDistance / totalFuel) * 10) / 10;
}

export interface DriverPerformanceRow {
  id: string;
  name: string;
  completedTrips: number;
  safetyScore: number;
  compositeScore: number;
}

export function getTopPerformingDrivers(
  drivers: Driver[],
  trips: Trip[],
  limit = 8
): DriverPerformanceRow[] {
  return drivers
    .map((driver) => {
      const completedTrips = trips.filter(
        (t) => t.driver_id === driver.id && t.status === "Completed"
      ).length;
      const compositeScore = Math.round(completedTrips * 12 + driver.safety_score * 0.4);

      return {
        id: driver.id,
        name: driver.name.split(" ")[0],
        completedTrips,
        safetyScore: driver.safety_score,
        compositeScore,
      };
    })
    .filter((row) => row.completedTrips > 0 || row.safetyScore >= 85)
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, limit);
}
