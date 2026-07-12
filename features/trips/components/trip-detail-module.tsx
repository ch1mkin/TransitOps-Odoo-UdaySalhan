"use client";

import { useQuery } from "@tanstack/react-query";
import {
  EntityDetailModule,
  EntityNotFound,
} from "@/components/data/entity-detail-module";
import { StatusBadge } from "@/components/data/status-badge";
import { TruckLoader } from "@/components/ui/truck-loader";
import { TripLifecycleActions } from "@/features/trips/components/trip-lifecycle-actions";
import { TripUpdatesTimeline } from "@/features/trips/components/trip-updates-timeline";
import { fetchFleetLabels, fetchTripById } from "@/lib/fleet/client-queries";
import type { Trip, TripUpdate } from "@/types/entities";

interface TripDetailModuleProps {
  id: string;
  compact?: boolean;
  initialData?: Trip | null;
  initialUpdates?: TripUpdate[];
  canManageLifecycle?: boolean;
}

export function TripDetailModule({
  id,
  compact = false,
  initialData,
  initialUpdates = [],
  canManageLifecycle = false,
}: TripDetailModuleProps) {
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchTripById(id),
    initialData: initialData ?? undefined,
    staleTime: initialData ? 60_000 : 0,
  });

  const { data: labels } = useQuery({
    queryKey: ["fleet-labels"],
    queryFn: fetchFleetLabels,
    staleTime: 60_000,
  });

  if (isLoading && !trip) {
    return (
      <div className="flex items-center justify-center py-16">
        <TruckLoader size="sm" label="Loading trip…" />
      </div>
    );
  }

  if (!trip) {
    return <EntityNotFound moduleName="trips" />;
  }

  const vehicleLabel = labels?.vehicles[trip.vehicle_id] ?? "—";
  const driverLabel = labels?.drivers[trip.driver_id] ?? "—";

  return (
    <div className="space-y-4">
      {!compact && (
        <TripLifecycleActions trip={trip} canManageLifecycle={canManageLifecycle} />
      )}
      <EntityDetailModule
        title={trip.trip_number}
        subtitle={`Trip ID · ${trip.id}`}
        status={trip.status}
        entityType="trip"
        entityId={trip.id}
        href={`/trips/${trip.id}`}
        compact={compact}
        fields={[
          { label: "Source", value: trip.source },
          { label: "Destination", value: trip.destination },
          { label: "Vehicle", value: vehicleLabel },
          { label: "Driver", value: driverLabel },
          {
            label: "Cargo Weight",
            value: `${trip.cargo_weight.toLocaleString()} kg`,
          },
          {
            label: "Planned Distance",
            value: `${trip.planned_distance.toLocaleString()} km`,
          },
          {
            label: "Dispatch Time",
            value: trip.dispatch_time
              ? new Date(trip.dispatch_time).toLocaleString()
              : "—",
          },
          { label: "Status", value: <StatusBadge status={trip.status} /> },
        ]}
      />
      {!compact ? <TripUpdatesTimeline updates={initialUpdates} /> : null}
    </div>
  );
}
