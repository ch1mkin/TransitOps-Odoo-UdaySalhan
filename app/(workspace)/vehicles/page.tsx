import { FleetDataError } from "@/components/data/fleet-data-error";
import { VehiclesModule } from "@/features/vehicles/components/vehicles-module";
import { canChangeVehicleStatus, canManageVehicles } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getVehicles } from "@/lib/fleet/queries";

export default async function VehiclesPage() {
  const role = await getPageRole();
  const result = await getVehicles();

  if (result.error || !result.data) {
    return <FleetDataError message={result.error ?? "Unknown error"} />;
  }

  return (
    <VehiclesModule
      vehicles={result.data}
      canCreate={canManageVehicles(role)}
      canChangeStatus={canChangeVehicleStatus(role)}
    />
  );
}
