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
import { createDriver } from "@/lib/fleet/actions";
import { driverSchema } from "@/lib/fleet/schemas";

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverFormDialog({ open, onOpenChange }: DriverFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      license_number: "",
      license_category: "HMV",
      license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      phone: "",
      email: "",
      safety_score: 80,
      status: "Available",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = driverSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setSubmitting(true);
    const result = await createDriver(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Driver added to roster");
    reset();
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Driver"
      description="Add a driver to the roster with license details."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="license_number">License Number</Label>
            <Input id="license_number" {...register("license_number")} />
            {errors.license_number && (
              <p className="text-xs text-destructive">
                {errors.license_number.message}
              </p>
            )}
          </div>

          <Select
            label="License Category"
            error={errors.license_category?.message}
            {...register("license_category")}
          >
            <option value="HMV">HMV</option>
            <option value="LMV">LMV</option>
          </Select>

          <div className="space-y-1.5">
            <Label htmlFor="license_expiry">License Expiry</Label>
            <Input id="license_expiry" type="date" {...register("license_expiry")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="safety_score">Safety Score</Label>
            <Input
              id="safety_score"
              type="number"
              min={0}
              max={100}
              {...register("safety_score")}
            />
          </div>

          <Select label="Status" error={errors.status?.message} {...register("status")}>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Add Driver"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
