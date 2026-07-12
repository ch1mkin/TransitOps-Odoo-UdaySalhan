"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { retireVehicle } from "@/lib/fleet/actions";

export function RetireVehicleButton({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRetire = async () => {
    setLoading(true);
    const result = await retireVehicle(vehicleId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Vehicle retired");
    router.refresh();
  };

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        disabled={loading}
        onClick={() => setOpen(true)}
      >
        {loading ? "Retiring…" : "Retire"}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Retire vehicle?"
        description="This vehicle will be removed from dispatch and marked as retired."
        confirmLabel="Retire"
        destructive
        loading={loading}
        onConfirm={handleRetire}
      />
    </>
  );
}
