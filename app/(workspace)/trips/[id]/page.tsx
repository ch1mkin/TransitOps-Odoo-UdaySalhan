import { TripDetailModule } from "@/features/trips/components/trip-detail-module";
import { canManageTripLifecycle } from "@/lib/fleet/permissions";
import { getTripById, getTripUpdates } from "@/lib/fleet/queries";
import { getSessionProfile } from "@/lib/fleet/session";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, session, updatesResult] = await Promise.all([
    getTripById(id),
    getSessionProfile(),
    getTripUpdates(id),
  ]);

  return (
    <TripDetailModule
      id={id}
      initialData={result.data}
      initialUpdates={updatesResult.data ?? []}
      canManageLifecycle={session.role ? canManageTripLifecycle(session.role) : false}
    />
  );
}
