"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createVehicle, updateVehicle } from "@/lib/fleet/actions";
import { uploadVehiclePhoto } from "@/lib/fleet/vehicle-photo-actions";
import { vehicleSchema } from "@/lib/fleet/schemas";
import {
  VehiclePhotoUploadSection,
  type PreparedVehiclePhoto,
} from "@/components/vehicles/vehicle-photo-upload-section";
import type { Vehicle } from "@/types/entities";

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicle,
}: VehicleFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<PreparedVehiclePhoto | null>(null);
  const isEdit = Boolean(vehicle);

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

  useEffect(() => {
    if (vehicle && open) {
      reset({
        registration_number: vehicle.registration_number,
        vehicle_name: vehicle.vehicle_name,
        vehicle_model: vehicle.vehicle_model,
        vehicle_type: vehicle.vehicle_type as "Heavy Truck" | "Medium Truck" | "Light Truck",
        max_load_capacity: vehicle.max_load_capacity,
        status: vehicle.status,
        odometer: vehicle.odometer,
        acquisition_cost: vehicle.acquisition_cost,
        purchase_date: vehicle.purchase_date,
      });
    }
  }, [vehicle, open, reset]);

  useEffect(() => {
    if (!open) {
      setPhoto(null);
    }
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    const parsed = vehicleSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    if (!isEdit && !photo) {
      toast.error("Please upload and crop a vehicle photo.");
      return;
    }

    setSubmitting(true);
    const result =
      isEdit && vehicle
        ? await updateVehicle(vehicle.id, parsed.data)
        : await createVehicle(parsed.data);

    if (!result.success) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }

    if (!isEdit && photo && result.id) {
      const formData = new FormData();
      formData.set("file", photo.file);
      const photoResult = await uploadVehiclePhoto(result.id, formData);
      if (!photoResult.success) {
        setSubmitting(false);
        toast.error(photoResult.error);
        return;
      }
    }

    setSubmitting(false);
    toast.success(isEdit ? "Vehicle updated" : "Vehicle added to fleet");
    if (!isEdit) {
      reset();
      setPhoto(null);
    }
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      description={
        isEdit
          ? "Update vehicle registry details."
          : "Register a new vehicle in the fleet."
      }
      className="w-[min(100%,48rem)]"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!isEdit ? (
          <VehiclePhotoUploadSection value={photo} onChange={setPhoto} disabled={submitting} />
        ) : null}

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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vehicle_model">Model</Label>
            <Input id="vehicle_model" {...register("vehicle_model")} />
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
            <Input id="max_load_capacity" type="number" {...register("max_load_capacity")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="odometer">Odometer (km)</Label>
            <Input id="odometer" type="number" {...register("odometer")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acquisition_cost">Acquisition Cost (₹)</Label>
            <Input id="acquisition_cost" type="number" {...register("acquisition_cost")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purchase_date">Purchase Date</Label>
            <Input id="purchase_date" type="date" {...register("purchase_date")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Vehicle"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
