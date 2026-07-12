"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Truck } from "lucide-react";
import { getVehiclePhotoUrl } from "@/lib/fleet/vehicle-photo-actions";

interface VehiclePhotoPanelProps {
  photoStoragePath?: string | null;
  vehicleName: string;
}

export function VehiclePhotoPanel({
  photoStoragePath,
  vehicleName,
}: VehiclePhotoPanelProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoStoragePath) {
      setPhotoUrl(null);
      return;
    }

    void getVehiclePhotoUrl(photoStoragePath).then((result) => {
      setPhotoUrl(result.url);
    });
  }, [photoStoragePath]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">Vehicle photo</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Registration photo captured during vehicle onboarding.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/20">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={`${vehicleName} photo`}
            width={640}
            height={480}
            className="h-56 w-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            <Truck className="mr-2 size-5" />
            No vehicle photo uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
