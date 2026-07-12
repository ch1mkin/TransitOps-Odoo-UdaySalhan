"use client";

import { DriverDetailModule } from "@/features/drivers/components/driver-detail-module";
import { TripDetailModule } from "@/features/trips/components/trip-detail-module";
import { VehicleDetailModule } from "@/features/vehicles/components/vehicle-detail-module";
import { ProfileTabModule } from "@/features/profile/components/profile-tab-module";

interface PopoutContentProps {
  href: string;
  compact?: boolean;
}

export function PopoutContent({ href, compact = true }: PopoutContentProps) {
  const vehicleMatch = href.match(/^\/vehicles\/([^/]+)$/);
  if (vehicleMatch) {
    return <VehicleDetailModule id={vehicleMatch[1]} compact={compact} />;
  }

  const driverMatch = href.match(/^\/drivers\/([^/]+)$/);
  if (driverMatch) {
    return <DriverDetailModule id={driverMatch[1]} compact={compact} />;
  }

  const tripMatch = href.match(/^\/trips\/([^/]+)$/);
  if (tripMatch) {
    return <TripDetailModule id={tripMatch[1]} compact={compact} />;
  }

  if (href === "/profile") {
    return <ProfileTabModule compact={compact} />;
  }

  return (
    <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
      Preview not available for this record.
    </div>
  );
}
