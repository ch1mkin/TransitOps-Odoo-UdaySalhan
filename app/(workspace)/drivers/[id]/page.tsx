import { DriverDetailModule } from "@/features/drivers/components/driver-detail-module";
import { canChangeDriverStatus, canManageDrivers } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getDriverById } from "@/lib/fleet/queries";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getPageRole();
  const result = await getDriverById(id);

  return (
    <DriverDetailModule
      id={id}
      initialData={result.data}
      canManage={canManageDrivers(role)}
      canChangeStatus={canChangeDriverStatus(role)}
    />
  );
}
