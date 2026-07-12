import { FleetDataError } from "@/components/data/fleet-data-error";
import { LicenseMonitoringModule } from "@/features/drivers/components/license-monitoring-module";
import { getDrivers } from "@/lib/fleet/queries";

export default async function LicenseMonitoringPage() {
  const result = await getDrivers();

  if (result.error || !result.data) {
    return <FleetDataError message={result.error ?? "Unknown error"} />;
  }

  return <LicenseMonitoringModule drivers={result.data} />;
}
