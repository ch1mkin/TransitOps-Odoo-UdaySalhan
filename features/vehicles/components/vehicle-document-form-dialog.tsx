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
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      vehicle_id: vehicles[0]?.id ?? "",
      document_type: "Insurance",
      expiry_date: "",
      notes: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.set("vehicle_id", values.vehicle_id);
    formData.set("document_type", values.document_type);
    formData.set("expiry_date", values.expiry_date);
    formData.set("notes", values.notes);
    formData.set("file", file);

    setSubmitting(true);
    const result = await uploadVehicleDocument(formData);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Document uploaded");
    reset();
    setFile(null);
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Document"
      description="Upload vehicle compliance files to Supabase Storage."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Select label="Vehicle" {...register("vehicle_id")}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_number}
            </option>
          ))}
        </Select>
        <div className="space-y-1.5">
          <Label htmlFor="document_type">Document Type</Label>
          <Input id="document_type" {...register("document_type")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="file">File (PDF or image, max 10 MB)</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-xs text-muted-foreground">{file.name}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expiry_date">Expiry Date (optional)</Label>
          <Input id="expiry_date" type="date" {...register("expiry_date")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" {...register("notes")} />
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
