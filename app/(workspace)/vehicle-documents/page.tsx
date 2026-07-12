import { FleetDataError } from "@/components/data/fleet-data-error";
import { VehicleDocumentsModule } from "@/features/vehicles/components/vehicle-documents-module";
import { canManageVehicleDocuments } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getFleetLabels, getVehicleDocuments, getVehicles } from "@/lib/fleet/queries";

export default async function VehicleDocumentsPage() {
  const role = await getPageRole();
  const [documentsResult, vehiclesResult, labelsResult] = await Promise.all([
    getVehicleDocuments(),
    getVehicles(),
    getFleetLabels(),
  ]);

  if (vehiclesResult.error || !vehiclesResult.data) {
    return <FleetDataError message={vehiclesResult.error ?? "Unknown error"} />;
  }

  if (labelsResult.error || !labelsResult.data) {
    return <FleetDataError message={labelsResult.error ?? "Unknown error"} />;
  }

  return (
    <VehicleDocumentsModule
      documents={documentsResult.data ?? []}
      vehicles={vehiclesResult.data}
      vehicleLabels={labelsResult.data.vehicles}
      canManage={canManageVehicleDocuments(role)}
    />
  );
}
