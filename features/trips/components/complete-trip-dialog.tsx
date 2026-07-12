"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { completeTrip } from "@/lib/fleet/actions";
import { completeTripSchema } from "@/lib/fleet/schemas";
import { fetchVehicleById } from "@/lib/fleet/client-queries";
import { formatNumber } from "@/lib/utils/format";
import type { Trip } from "@/types/entities";

interface CompleteTripDialogProps {
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: (trip: Trip) => void;
}

export function CompleteTripDialog({
  trip,
  open,
  onOpenChange,
  onCompleted,
}: CompleteTripDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [currentOdometer, setCurrentOdometer] = useState<number | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      actual_distance: trip.planned_distance,
      fuel_used: trip.fuel_used ?? 0,
      revenue: trip.revenue ?? 0,
      closing_odometer: 0,
    },
  });

  useEffect(() => {
    if (!open) return;

    void fetchVehicleById(trip.vehicle_id).then((vehicle) => {
      if (!vehicle) return;
      setCurrentOdometer(vehicle.odometer);
      reset({
        actual_distance: trip.planned_distance,
        fuel_used: trip.fuel_used ?? 0,
        revenue: trip.revenue ?? 0,
        closing_odometer: vehicle.odometer + trip.planned_distance,
      });
    });
  }, [open, reset, trip.fuel_used, trip.planned_distance, trip.revenue, trip.vehicle_id]);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = completeTripSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    if (currentOdometer != null && parsed.data.closing_odometer < currentOdometer) {
      toast.error(`Closing odometer must be at least ${formatNumber(currentOdometer)} km.`);
      return;
    }

    setSubmitting(true);
    const result = await completeTrip(trip.id, parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Trip completed");
    onCompleted?.({
      ...trip,
      status: "Completed",
      actual_distance: parsed.data.actual_distance,
      fuel_used: parsed.data.fuel_used,
      revenue: parsed.data.revenue,
      completion_time: new Date().toISOString(),
    });
    onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Complete trip"
      description={`Record final metrics for ${trip.trip_number}`}
      className="w-[min(100%,28rem)]"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="actual_distance">Actual distance (km)</Label>
          <Input
            id="actual_distance"
            type="number"
            min={1}
            {...register("actual_distance")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="closing_odometer">Closing odometer (km)</Label>
          <Input
            id="closing_odometer"
            type="number"
            min={currentOdometer ?? 0}
            {...register("closing_odometer")}
          />
          {currentOdometer != null ? (
            <p className="text-xs text-muted-foreground">
              Current vehicle odometer: {formatNumber(currentOdometer)} km
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fuel_used">Fuel used (liters)</Label>
          <Input id="fuel_used" type="number" min={0} step="0.1" {...register("fuel_used")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="revenue">Revenue (₹)</Label>
          <Input id="revenue" type="number" min={0} {...register("revenue")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Completing…" : "Complete trip"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
