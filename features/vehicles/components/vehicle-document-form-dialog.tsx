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
import {
  VehicleProofUploadSection,
  type PreparedVehicleProof,
} from "@/components/vehicles/vehicle-proof-upload-section";
import { uploadVehicleDocument } from "@/lib/fleet/actions";
import type { Vehicle } from "@/types/entities";

interface VehicleDocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
}

export function VehicleDocumentFormDialog({
  open,
  onOpenChange,
  vehicles,
}: VehicleDocumentFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [proof, setProof] = useState<PreparedVehicleProof | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      vehicle_id: vehicles[0]?.id ?? "",
      expiry_date: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      setProof(null);
    }
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    if (!proof) {
      toast.error("Please upload and crop a vehicle document.");
      return;
    }

    const formData = new FormData();
    formData.set("vehicle_id", values.vehicle_id);
    formData.set("document_type", proof.documentType);
    formData.set("expiry_date", values.expiry_date);
    formData.set("notes", values.notes);
    formData.set("file", proof.file);

    setSubmitting(true);
    const result = await uploadVehicleDocument(formData);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Document uploaded");
    reset();
    setProof(null);
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Document"
      description="Upload vehicle registration, insurance, fitness, or PUC proof with QR or desktop capture."
      className="w-[min(100%,48rem)]"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <VehicleProofUploadSection
          value={proof}
          onChange={setProof}
          disabled={submitting}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Vehicle" {...register("vehicle_id")}>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration_number}
              </option>
            ))}
          </Select>

          <div className="space-y-1.5">
            <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
            <Input id="expiry_date" type="date" {...register("expiry_date")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register("notes")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
