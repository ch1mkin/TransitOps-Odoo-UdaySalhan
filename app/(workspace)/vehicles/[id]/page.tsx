import { VehicleDetailModule } from "@/features/vehicles/components/vehicle-detail-module";
import { getVehicleById } from "@/lib/fleet/queries";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getVehicleById(id);

  return <VehicleDetailModule id={id} initialData={result.data} />;
}
