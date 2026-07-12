"use client";

import { useQuery } from "@tanstack/react-query";
import {
  EntityDetailModule,
  EntityNotFound,
} from "@/components/data/entity-detail-module";
import { StatusBadge } from "@/components/data/status-badge";
import { TruckLoader } from "@/components/ui/truck-loader";
import { fetchDriverById } from "@/lib/fleet/client-queries";
import type { Driver } from "@/types/entities";

interface DriverDetailModuleProps {
  id: string;
  compact?: boolean;
  initialData?: Driver | null;
}

export function DriverDetailModule({
  id,
  compact = false,
  initialData,
}: DriverDetailModuleProps) {
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
    <EntityDetailModule
      title={driver.name}
      subtitle={`Driver ID · ${driver.id}`}
      status={driver.status}
      entityType="driver"
      entityId={driver.id}
      href={`/drivers/${driver.id}`}
      compact={compact}
      fields={[
        { label: "License Number", value: driver.license_number },
        { label: "License Category", value: driver.license_category },
        { label: "License Expiry", value: driver.license_expiry },
        { label: "Phone", value: driver.phone },
        { label: "Email", value: driver.email },
        { label: "Safety Score", value: `${driver.safety_score}%` },
        { label: "Status", value: <StatusBadge status={driver.status} /> },
      ]}
    />
  );
}
