import { FleetDataError } from "@/components/data/fleet-data-error";
import { MaintenanceModule } from "@/features/maintenance/components/maintenance-module";
import { canManageMaintenance } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getFleetLabels, getMaintenanceLogs, getVehicles } from "@/lib/fleet/queries";

export default async function MaintenancePage() {
  const role = await getPageRole();
  const [recordsResult, labelsResult, vehiclesResult] = await Promise.all([
    getMaintenanceLogs(),
    getFleetLabels(),
    getVehicles(),
  ]);

  if (recordsResult.error || !recordsResult.data) {
    return (
      <FleetDataError
        message={recordsResult.error ?? "Run migration 007_ops_tables.sql"}
      />
    );
  }

  if (labelsResult.error || !labelsResult.data) {
    return <FleetDataError message={labelsResult.error ?? "Unknown error"} />;
  }

  if (vehiclesResult.error || !vehiclesResult.data) {
    return <FleetDataError message={vehiclesResult.error ?? "Unknown error"} />;
  }

  return (
    <MaintenanceModule
      records={recordsResult.data}
      vehicles={vehiclesResult.data}
      vehicleLabels={labelsResult.data.vehicles}
      canManage={canManageMaintenance(role)}
    />
  );
}
