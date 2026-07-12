import { VehicleDetailModule } from "@/features/vehicles/components/vehicle-detail-module";
import { canChangeVehicleStatus, canManageVehicles } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getVehicleById } from "@/lib/fleet/queries";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getPageRole();
  const result = await getVehicleById(id);

  return (
    <VehicleDetailModule
      id={id}
      initialData={result.data}
      canManage={canManageVehicles(role)}
      canChangeStatus={canChangeVehicleStatus(role)}
    />
  );
}
