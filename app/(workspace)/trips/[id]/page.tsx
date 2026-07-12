import { TripDetailModule } from "@/features/trips/components/trip-detail-module";
import { getTripById } from "@/lib/fleet/queries";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getTripById(id);

  return <TripDetailModule id={id} initialData={result.data} />;
}
