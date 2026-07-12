import { DriverDetailModule } from "@/features/drivers/components/driver-detail-module";
import { getDriverById } from "@/lib/fleet/queries";

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getDriverById(id);

  return <DriverDetailModule id={id} initialData={result.data} />;
}
