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
import { TruckLoader } from "@/components/ui/truck-loader";
import { DriverFormDialog } from "@/features/drivers/components/driver-form-dialog";
import { updateDriverStatus } from "@/lib/fleet/actions";
import { fetchDriverById } from "@/lib/fleet/client-queries";
import { MANUAL_DRIVER_STATUSES } from "@/lib/fleet/status-rules";
import type { Driver, DriverStatus } from "@/types/entities";

interface DriverDetailModuleProps {
  id: string;
  compact?: boolean;
  initialData?: Driver | null;
  canManage?: boolean;
  canChangeStatus?: boolean;
}

export function DriverDetailModule({
  id,
  compact = false,
  initialData,
  canManage = false,
  canChangeStatus = false,
}: DriverDetailModuleProps) {
  const [formOpen, setFormOpen] = useState(false);

  const { data: driver, isLoading } = useQuery({
    queryKey: ["driver", id],
    queryFn: () => fetchDriverById(id),
    initialData: initialData ?? undefined,
    staleTime: initialData ? 60_000 : 0,
  });

  if (isLoading && !driver) {
    return (
      <div className="flex items-center justify-center py-16">
        <TruckLoader size="sm" label="Loading driver…" />
      </div>
    );
  }

  if (!driver) {
    return <EntityNotFound moduleName="drivers" />;
  }

  return (
    <>
      <EntityDetailModule
        title={driver.name}
        subtitle={`Driver ID · ${driver.id}`}
        status={driver.status}
        entityType="driver"
        entityId={driver.id}
        href={`/drivers/${driver.id}`}
        compact={compact}
        actions={
          canManage ? (
            <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
              Edit Profile
            </Button>
          ) : undefined
        }
        fields={[
          { label: "License Number", value: driver.license_number },
          { label: "License Category", value: driver.license_category },
          { label: "License Expiry", value: driver.license_expiry },
          { label: "Phone", value: driver.phone },
          { label: "Email", value: driver.email },
          { label: "Safety Score", value: `${driver.safety_score}%` },
          {
            label: "Status",
            value: canChangeStatus ? (
              <InlineStatusSelect
                value={driver.status}
                options={MANUAL_DRIVER_STATUSES}
                disabled={driver.status === "On Trip"}
                confirmChange={(next) =>
                  next === "Suspended"
                    ? {
                        title: "Suspend driver?",
                        description:
                          "Suspended drivers cannot be assigned to trips until reinstated.",
                        destructive: true,
                      }
                    : null
                }
                onChange={async (status) => {
                  const result = await updateDriverStatus(id, status as DriverStatus);
                  return result.success
                    ? { success: true }
                    : { success: false, error: result.error };
                }}
              />
            ) : (
              <StatusBadge status={driver.status} />
            ),
          },
        ]}
      />

      {canManage ? (
        <DriverFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          driver={driver}
        />
      ) : null}
    </>
  );
}
