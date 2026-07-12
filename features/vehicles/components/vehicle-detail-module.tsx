"use client";

import { useQuery } from "@tanstack/react-query";
import {
  EntityDetailModule,
  EntityNotFound,
} from "@/components/data/entity-detail-module";
import { StatusBadge } from "@/components/data/status-badge";
import { TruckLoader } from "@/components/ui/truck-loader";
import { fetchVehicleById } from "@/lib/fleet/client-queries";
import type { Vehicle } from "@/types/entities";

interface VehicleDetailModuleProps {
  id: string;
  compact?: boolean;
  initialData?: Vehicle | null;
}

export function VehicleDetailModule({
  id,
  compact = false,
  initialData,
}: VehicleDetailModuleProps) {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => fetchVehicleById(id),
    initialData: initialData ?? undefined,
    staleTime: initialData ? 60_000 : 0,
  });

  if (isLoading && !vehicle) {
    return (
      <div className="flex items-center justify-center py-16">
        <TruckLoader size="sm" label="Loading vehicle…" />
      </div>
    );
  }

  if (!vehicle) {
    return <EntityNotFound moduleName="vehicles" />;
  }

  return (
    <EntityDetailModule
      title={vehicle.registration_number}
      subtitle={`Vehicle ID · ${vehicle.id}`}
      status={vehicle.status}
      entityType="vehicle"
      entityId={vehicle.id}
      href={`/vehicles/${vehicle.id}`}
      compact={compact}
      fields={[
        { label: "Vehicle Name", value: vehicle.vehicle_name },
        { label: "Model", value: vehicle.vehicle_model },
        { label: "Type", value: vehicle.vehicle_type },
        {
          label: "Max Capacity",
          value: `${vehicle.max_load_capacity.toLocaleString()} kg`,
        },
        {
          label: "Odometer",
          value: `${vehicle.odometer.toLocaleString()} km`,
        },
        {
          label: "Acquisition Cost",
          value: `₹${vehicle.acquisition_cost.toLocaleString()}`,
        },
        { label: "Purchase Date", value: vehicle.purchase_date },
        { label: "Status", value: <StatusBadge status={vehicle.status} /> },
      ]}
    />
  );
}
