"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  cancelTrip,
  completeTrip,
  dispatchTrip,
} from "@/lib/fleet/actions";
import type { Trip } from "@/types/entities";

interface TripLifecycleActionsProps {
  trip: Trip;
  canManageLifecycle: boolean;
}

type PendingAction = "dispatch" | "complete" | "cancel" | null;

const COPY = {
  dispatch: {
    title: "Dispatch trip?",
    description: "Vehicle and driver will be marked On Trip.",
    label: "Dispatch",
  },
  complete: {
    title: "Complete trip?",
    description: "Vehicle and driver will return to Available.",
    label: "Complete",
  },
  cancel: {
    title: "Cancel trip?",
    description: "This trip will be cancelled. Dispatched resources will be released.",
    label: "Cancel trip",
    destructive: true,
  },
} as const;

export function TripLifecycleActions({
  trip,
  canManageLifecycle,
}: TripLifecycleActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  if (!canManageLifecycle) {
    return null;
  }

  const run = (action: PendingAction) => {
    if (!action) return;

    const handlers = {
      dispatch: () => dispatchTrip(trip.id),
      complete: () => completeTrip(trip.id),
      cancel: () => cancelTrip(trip.id),
    };

    startTransition(async () => {
      const result = await handlers[action]();
      if (!result.success) {
        toast.error(result.error ?? "Action failed");
        return;
      }
      toast.success(`Trip ${COPY[action].label.toLowerCase()} successful`);
      router.refresh();
    });
  };

  const dialogCopy = pendingAction ? COPY[pendingAction] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {trip.status === "Draft" && (
          <Button size="sm" disabled={isPending} onClick={() => setPendingAction("dispatch")}>
            Dispatch
          </Button>
        )}
        {trip.status === "Dispatched" && (
          <Button size="sm" disabled={isPending} onClick={() => setPendingAction("complete")}>
            Complete
          </Button>
        )}
        {(trip.status === "Draft" || trip.status === "Dispatched") && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => setPendingAction("cancel")}
          >
            Cancel
          </Button>
        )}
      </div>

      {dialogCopy && pendingAction ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingAction(null);
          }}
          title={dialogCopy.title}
          description={dialogCopy.description}
          confirmLabel={dialogCopy.label}
          destructive={"destructive" in dialogCopy ? dialogCopy.destructive : false}
          loading={isPending}
          onConfirm={() => run(pendingAction)}
        />
      ) : null}
    </>
  );
}
