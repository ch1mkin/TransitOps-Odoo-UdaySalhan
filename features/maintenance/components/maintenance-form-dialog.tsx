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
import { createMaintenance } from "@/lib/fleet/actions";
import { maintenanceSchema } from "@/lib/fleet/schemas";
import type { Vehicle } from "@/types/entities";

interface MaintenanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
}

export function MaintenanceFormDialog({
  open,
  onOpenChange,
  vehicles,
}: MaintenanceFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      vehicle_id: vehicles[0]?.id ?? "",
      maintenance_type: "Scheduled Service",
      description: "",
      cost: 0,
      service_center: "",
      opened_at: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = maintenanceSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setSubmitting(true);
    const result = await createMaintenance(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Maintenance scheduled — vehicle moved to In Shop");
    reset();
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Schedule Maintenance"
      description="Opens a maintenance log and sets the vehicle to In Shop."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select label="Vehicle" error={errors.vehicle_id?.message} {...register("vehicle_id")}>
          {vehicles
            .filter((v) => v.status !== "Retired")
            .map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration_number} · {v.vehicle_name}
              </option>
            ))}
        </Select>

        <div className="space-y-1.5">
          <Label htmlFor="maintenance_type">Maintenance Type</Label>
          <Input id="maintenance_type" {...register("maintenance_type")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cost">Estimated Cost (₹)</Label>
            <Input id="cost" type="number" {...register("cost")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opened_at">Opened Date</Label>
            <Input id="opened_at" type="date" {...register("opened_at")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="service_center">Service Center</Label>
          <Input id="service_center" {...register("service_center")} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling…" : "Schedule"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
