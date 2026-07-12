"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createTrip } from "@/lib/fleet/actions";
import { tripSchema } from "@/lib/fleet/schemas";
import {
  assertDriverAssignable,
  assertVehicleDispatchable,
} from "@/lib/fleet/trip-lifecycle";
import { ROLES } from "@/constants/roles";
import { useSettingsStore } from "@/store/settings-store";
import type { Driver, Vehicle } from "@/types/entities";

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
}

export function TripFormDialog({
  open,
  onOpenChange,
  vehicles,
  drivers,
}: TripFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const eligibleOnly = useSettingsStore(
    (s) => s.byRole[ROLES.DISPATCHER].showOnlyEligibleInTripForm
  );

  const selectableVehicles = useMemo(() => {
    if (!eligibleOnly) return vehicles;
    return vehicles.filter((vehicle) => {
      try {
        assertVehicleDispatchable(vehicle);
        return true;
      } catch {
        return false;
      }
    });
  }, [vehicles, eligibleOnly]);

  const selectableDrivers = useMemo(() => {
    if (!eligibleOnly) return drivers;
    return drivers.filter((driver) => {
      try {
        assertDriverAssignable(driver);
        return true;
      } catch {
        return false;
      }
    });
  }, [drivers, eligibleOnly]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      trip_number: "",
      source: "",
      destination: "",
      vehicle_id: selectableVehicles[0]?.id ?? "",
      driver_id: selectableDrivers[0]?.id ?? "",
      cargo_weight: 0,
      planned_distance: 0,
      status: "Draft",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = tripSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setSubmitting(true);
    const result = await createTrip(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Trip created");
    reset();
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="New Trip"
      description="Create a dispatch record and assign vehicle and driver."
      className="w-[min(100%,36rem)]"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="trip_number">Trip Number</Label>
            <Input id="trip_number" placeholder="TR-1052" {...register("trip_number")} />
            {errors.trip_number && (
              <p className="text-xs text-destructive">{errors.trip_number.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source">Source</Label>
            <Input id="source" {...register("source")} />
            {errors.source && (
              <p className="text-xs text-destructive">{errors.source.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" {...register("destination")} />
            {errors.destination && (
              <p className="text-xs text-destructive">{errors.destination.message}</p>
            )}
          </div>

          <Select
            label="Vehicle"
            error={errors.vehicle_id?.message}
            {...register("vehicle_id")}
          >
            <option value="">Select vehicle</option>
            {selectableVehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.registration_number} — {vehicle.vehicle_name}
              </option>
            ))}
          </Select>

          <Select
            label="Driver"
            error={errors.driver_id?.message}
            {...register("driver_id")}
          >
            <option value="">Select driver</option>
            {selectableDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </Select>

          <div className="space-y-1.5">
            <Label htmlFor="cargo_weight">Cargo Weight (kg)</Label>
            <Input id="cargo_weight" type="number" {...register("cargo_weight")} />
            {errors.cargo_weight && (
              <p className="text-xs text-destructive">{errors.cargo_weight.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="planned_distance">Planned Distance (km)</Label>
            <Input
              id="planned_distance"
              type="number"
              {...register("planned_distance")}
            />
            {errors.planned_distance && (
              <p className="text-xs text-destructive">
                {errors.planned_distance.message}
              </p>
            )}
          </div>

          <Select label="Status" error={errors.status?.message} {...register("status")}>
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create Trip"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
