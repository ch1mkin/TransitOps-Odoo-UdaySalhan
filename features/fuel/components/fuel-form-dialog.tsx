"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createFuelLog } from "@/lib/fleet/actions";
import { fuelLogSchema } from "@/lib/fleet/schemas";
import type { Vehicle } from "@/types/entities";

interface FuelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
}

export function FuelFormDialog({ open, onOpenChange, vehicles }: FuelFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicle_id: vehicles[0]?.id ?? "",
      liters: 0,
      cost: 0,
      odometer: 0,
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = fuelLogSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setSubmitting(true);
    const result = await createFuelLog(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Fuel log recorded");
    reset();
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Record Fuel" description="Log fuel purchase for a vehicle.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Select label="Vehicle" {...register("vehicle_id")}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.registration_number}</option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="liters">Liters</Label>
            <Input id="liters" type="number" step="0.1" {...register("liters")} />
            {errors.liters && <p className="text-xs text-destructive">{errors.liters.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost">Cost (₹)</Label>
            <Input id="cost" type="number" {...register("cost")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="odometer">Odometer (km)</Label>
            <Input id="odometer" type="number" {...register("odometer")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Record"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
