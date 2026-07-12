"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  approveDriverRegistration,
  rejectDriverRegistration,
} from "@/lib/fleet/driver-registration-actions";

interface DriverApprovalPanelProps {
  driverId: string;
  driverName: string;
}

export function DriverApprovalPanel({
  driverId,
  driverName,
}: DriverApprovalPanelProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    setLoading("approve");
    const result = await approveDriverRegistration(driverId);
    setLoading(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`${driverName} has been approved.`);
    window.location.reload();
  };

  const handleReject = async () => {
    const reason = window.prompt(
      "Optional rejection reason for your records:",
      "Information could not be verified."
    );

    if (reason === null) return;

    setLoading("reject");
    const result = await rejectDriverRegistration(driverId, reason);
    setLoading(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Registration rejected.");
    window.location.assign("/drivers");
  };

  return (
    <div className="rounded-xl border border-violet-300/40 bg-violet-500/10 p-4">
      <p className="text-sm font-medium text-foreground">Pending operator approval</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {driverName} submitted this profile through a self-registration link. Review the details
        and documents below before approving.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => void handleApprove()}
          disabled={loading !== null}
        >
          {loading === "approve" ? "Approving…" : "Approve driver"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void handleReject()}
          disabled={loading !== null}
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </Button>
      </div>
    </div>
  );
}
