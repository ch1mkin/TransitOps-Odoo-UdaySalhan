"use client";

import { useState, useTransition, useOptimistic } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { CompleteTripDialog } from "@/features/trips/components/complete-trip-dialog";
import { cancelTrip, dispatchTrip } from "@/lib/fleet/actions";
import type { Trip } from "@/types/entities";

interface TripLifecycleActionsProps {
  trip: Trip;
  canManageLifecycle: boolean;
}

type PendingAction = "dispatch" | "cancel" | null;

const COPY = {
  dispatch: {
    title: "Dispatch trip?",
    description: "Vehicle and driver will be marked On Trip.",
    label: "Dispatch",
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
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [optimisticTrip, setOptimisticTrip] = useOptimistic(trip, (_current, next: Trip) => next);

  if (!canManageLifecycle) {
    return null;
  }

  const patchTrip = (next: Trip) => {
    setOptimisticTrip(next);
    queryClient.setQueryData(["trip", trip.id], next);
  };

  const runLifecycle = (action: PendingAction) => {
    if (!action) return;

    const handlers = {
      dispatch: () => dispatchTrip(trip.id),
      cancel: () => cancelTrip(trip.id),
    };

    const optimistic: Trip =
      action === "dispatch"
        ? { ...optimisticTrip, status: "Dispatched", dispatch_time: new Date().toISOString() }
        : { ...optimisticTrip, status: "Cancelled" };

    patchTrip(optimistic);

    startTransition(async () => {
      const result = await handlers[action]();
      if (!result.success) {
        patchTrip(trip);
        toast.error(result.error ?? "Action failed");
        return;
      }
      toast.success(`Trip ${COPY[action].label.toLowerCase()} successful`);
      await queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
    });
  };

  const dialogCopy = pendingAction ? COPY[pendingAction] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {optimisticTrip.status === "Draft" && (
          <Button size="sm" disabled={isPending} onClick={() => setPendingAction("dispatch")}>
            Dispatch
          </Button>
        )}
        {optimisticTrip.status === "Dispatched" && (
          <Button size="sm" disabled={isPending} onClick={() => setCompleteOpen(true)}>
            Complete
          </Button>
        )}
        {(optimisticTrip.status === "Draft" || optimisticTrip.status === "Dispatched") && (
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
          onConfirm={() => runLifecycle(pendingAction)}
        />
      ) : null}

      <CompleteTripDialog
        trip={optimisticTrip}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onCompleted={(next) => {
          patchTrip(next);
          void queryClient.invalidateQueries({ queryKey: ["trip", trip.id] });
        }}
      />
    </>
  );
}
