"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface ConfirmChange {
  title: string;
  description: string;
  destructive?: boolean;
}

interface InlineStatusSelectProps<T extends string> {
  value: T;
  options: T[];
  disabled?: boolean;
  onChange: (value: T) => Promise<{ success: boolean; error?: string }>;
  confirmChange?: (next: T) => ConfirmChange | null;
  className?: string;
}

export function InlineStatusSelect<T extends string>({
  value,
  options,
  disabled = false,
  onChange,
  confirmChange,
  className,
}: InlineStatusSelectProps<T>) {
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState<T | null>(null);
  const [optimisticValue, setOptimisticValue] = useOptimistic(value, (_current, next: T) => next);

  const applyChange = (next: T) => {
    setOptimisticValue(next);

    startTransition(async () => {
      const result = await onChange(next);
      if (!result.success) {
        setOptimisticValue(value);
        toast.error(result.error ?? "Status update failed.");
        return;
      }
      toast.success("Status updated");
      setPending(null);
    });
  };

  const handleChange = (next: T) => {
    if (next === optimisticValue || isPending) return;

    const confirmation = confirmChange?.(next);
    if (confirmation) {
      setPending(next);
      return;
    }

    applyChange(next);
  };

  const isLocked = disabled || optimisticValue === "On Trip" || isPending;

  return (
    <>
      <select
        value={optimisticValue}
        disabled={isLocked}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => handleChange(e.target.value as T)}
        className={cn(
          "h-8 min-w-[7.5rem] rounded-lg border border-border bg-background px-2 text-xs font-medium shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isLocked && "cursor-not-allowed opacity-60",
          isPending && "opacity-70",
          className
        )}
        aria-label="Change status"
      >
        {optimisticValue === "On Trip" && !options.includes("On Trip" as T) ? (
          <option value="On Trip">On Trip</option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {pending ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
          title={confirmChange?.(pending)?.title ?? "Change status?"}
          description={confirmChange?.(pending)?.description}
          confirmLabel="Confirm"
          destructive={confirmChange?.(pending)?.destructive}
          loading={isPending}
          onConfirm={() => applyChange(pending)}
        />
      ) : null}
    </>
  );
}
