import { MobileTripTracker } from "@/components/trips/mobile-trip-tracker";
import { getTripByTrackingToken } from "@/lib/fleet/trip-location-actions";

export default async function TripTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const trip = await getTripByTrackingToken(token);

  if (!trip.valid || !trip.tripNumber) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold">Tracking unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {trip.error ?? "This tracking link is invalid or the trip has ended."}
          </p>
        </div>
      </div>
    );
  }

  return <MobileTripTracker token={token} tripNumber={trip.tripNumber} />;
}
