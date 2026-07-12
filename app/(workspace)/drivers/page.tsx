import { FleetDataError } from "@/components/data/fleet-data-error";
import { DriversModule } from "@/features/drivers/components/drivers-module";
import { canChangeDriverStatus, canManageDrivers } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getDrivers } from "@/lib/fleet/queries";

export default async function DriversPage() {
  const role = await getPageRole();
  const result = await getDrivers();

  if (result.error || !result.data) {
    return <FleetDataError message={result.error ?? "Unknown error"} />;
  }

  return (
    <DriversModule
      drivers={result.data}
      canCreate={canManageDrivers(role)}
      canChangeStatus={canChangeDriverStatus(role)}
    />
  );
}
