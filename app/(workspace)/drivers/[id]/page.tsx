import { DriverDetailModule } from "@/features/drivers/components/driver-detail-module";
import { canChangeDriverStatus, canManageDrivers } from "@/lib/fleet/permissions";
import { getPageRole } from "@/lib/fleet/page-role";
import { getDriverById, getDriverDocuments } from "@/lib/fleet/queries";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getPageRole();
  const [result, documentsResult] = await Promise.all([
    getDriverById(id),
    getDriverDocuments(id),
  ]);

  return (
    <DriverDetailModule
      id={id}
      initialData={result.data}
      initialDocuments={documentsResult.data ?? []}
      canManage={canManageDrivers(role)}
      canChangeStatus={canChangeDriverStatus(role)}
    />
  );
}
