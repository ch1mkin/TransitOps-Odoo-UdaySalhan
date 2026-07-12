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
import { createVehicle } from "@/lib/fleet/actions";
import { vehicleSchema } from "@/lib/fleet/schemas";

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleFormDialog({ open, onOpenChange }: VehicleFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      registration_number: "",
      vehicle_name: "",
      vehicle_model: "",
      vehicle_type: "Heavy Truck",
      max_load_capacity: 0,
      status: "Available",
      odometer: 0,
      acquisition_cost: 0,
      purchase_date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = vehicleSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setSubmitting(true);
    const result = await createVehicle(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Vehicle added to fleet");
    reset();
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Vehicle"
      description="Register a new vehicle in the fleet."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input
              id="registration_number"
              placeholder="MH-12-AB-1234"
              {...register("registration_number")}
            />
            {errors.registration_number && (
              <p className="text-xs text-destructive">
                {errors.registration_number.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vehicle_name">Vehicle Name</Label>
            <Input id="vehicle_name" {...register("vehicle_name")} />
            {errors.vehicle_name && (
              <p className="text-xs text-destructive">{errors.vehicle_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vehicle_model">Model</Label>
            <Input id="vehicle_model" {...register("vehicle_model")} />
            {errors.vehicle_model && (
              <p className="text-xs text-destructive">{errors.vehicle_model.message}</p>
            )}
          </div>

          <Select label="Type" error={errors.vehicle_type?.message} {...register("vehicle_type")}>
            <option value="Heavy Truck">Heavy Truck</option>
            <option value="Medium Truck">Medium Truck</option>
            <option value="Light Truck">Light Truck</option>
          </Select>

          <Select label="Status" error={errors.status?.message} {...register("status")}>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </Select>

          <div className="space-y-1.5">
            <Label htmlFor="max_load_capacity">Max Capacity (kg)</Label>
            <Input
              id="max_load_capacity"
              type="number"
              {...register("max_load_capacity")}
            />
            {errors.max_load_capacity && (
              <p className="text-xs text-destructive">
                {errors.max_load_capacity.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="odometer">Odometer (km)</Label>
            <Input id="odometer" type="number" {...register("odometer")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acquisition_cost">Acquisition Cost (₹)</Label>
            <Input
              id="acquisition_cost"
              type="number"
              {...register("acquisition_cost")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input id="purchase_date" type="date" {...register("purchase_date")} />
            {errors.purchase_date && (
              <p className="text-xs text-destructive">{errors.purchase_date.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
