"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  EntityDetailModule,
  EntityNotFound,
} from "@/components/data/entity-detail-module";
import { InlineStatusSelect } from "@/components/data/inline-status-select";
import { StatusBadge } from "@/components/data/status-badge";
import { Button } from "@/components/ui/button";
import { TruckLoaderSection } from "@/components/ui/truck-loader";
import { VehicleFormDialog } from "@/features/vehicles/components/vehicle-form-dialog";
import { RetireVehicleButton } from "@/features/vehicles/components/retire-vehicle-button";
import { VehiclePhotoPanel } from "@/components/vehicles/vehicle-photo-panel";
import { updateVehicleStatus } from "@/lib/fleet/actions";
import { fetchVehicleById } from "@/lib/fleet/client-queries";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { MANUAL_VEHICLE_STATUSES } from "@/lib/fleet/status-rules";
import type { Vehicle, VehicleStatus } from "@/types/entities";

interface VehicleDetailModuleProps {
  id: string;
  compact?: boolean;
  initialData?: Vehicle | null;
  canManage?: boolean;
  canChangeStatus?: boolean;
}

export function VehicleDetailModule({
  id,
  compact = false,
  initialData,
  canManage = false,
  canChangeStatus = false,
}: VehicleDetailModuleProps) {
  const [formOpen, setFormOpen] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => fetchVehicleById(id),
    initialData: initialData ?? undefined,
    staleTime: initialData ? 60_000 : 0,
  });

  if (isLoading && !vehicle) {
    return <TruckLoaderSection size="sm" label="Loading vehicle…" className="min-h-[280px]" />;
  }

  if (!vehicle) {
    return <EntityNotFound moduleName="vehicles" />;
  }

  return (
    <>
      <EntityDetailModule
        title={vehicle.registration_number}
        subtitle={`Vehicle ID · ${vehicle.id}`}
        status={vehicle.status}
        entityType="vehicle"
        entityId={vehicle.id}
        href={`/vehicles/${vehicle.id}`}
        compact={compact}
        actions={
          canManage && vehicle.status !== "Retired" ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
                Edit
              </Button>
              <RetireVehicleButton vehicleId={vehicle.id} />
            </>
          ) : undefined
        }
        fields={[
          { label: "Vehicle Name", value: vehicle.vehicle_name },
          { label: "Model", value: vehicle.vehicle_model },
          { label: "Type", value: vehicle.vehicle_type },
          {
            label: "Max Capacity",
            value: `${formatNumber(vehicle.max_load_capacity)} kg`,
          },
          {
            label: "Odometer",
            value: `${formatNumber(vehicle.odometer)} km`,
          },
          {
            label: "Acquisition Cost",
            value: formatCurrency(vehicle.acquisition_cost),
          },
          { label: "Purchase Date", value: vehicle.purchase_date },
          {
            label: "Status",
            value: canChangeStatus ? (
              <InlineStatusSelect
                value={vehicle.status}
                options={MANUAL_VEHICLE_STATUSES}
                disabled={vehicle.status === "On Trip"}
                confirmChange={(next) =>
                  next === "Retired"
                    ? {
                        title: "Retire vehicle?",
                        description:
                          "This vehicle will be removed from dispatch and marked as retired.",
                        destructive: true,
                      }
                    : null
                }
                onChange={async (status) => {
                  const result = await updateVehicleStatus(id, status as VehicleStatus);
                  return result.success
                    ? { success: true }
                    : { success: false, error: result.error };
                }}
              />
            ) : (
              <StatusBadge status={vehicle.status} />
            ),
          },
        ]}
      />

      <VehiclePhotoPanel
        photoStoragePath={vehicle.photo_storage_path}
        vehicleName={vehicle.vehicle_name}
      />

      {canManage ? (
        <VehicleFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          vehicle={vehicle}
        />
      ) : null}
    </>
  );
}
