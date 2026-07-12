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
import { createExpense } from "@/lib/fleet/actions";
import { expenseSchema } from "@/lib/fleet/schemas";
import type { Vehicle } from "@/types/entities";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
}

export function ExpenseFormDialog({ open, onOpenChange, vehicles }: ExpenseFormDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      vehicle_id: vehicles[0]?.id ?? "",
      category: "Operations",
      amount: 0,
      description: "",
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const parsed = expenseSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setSubmitting(true);
    const result = await createExpense(parsed.data);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Expense recorded");
    reset();
    onOpenChange(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Record Expense" description="Log an operational expense.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Select label="Vehicle" {...register("vehicle_id")}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.registration_number}</option>
          ))}
        </Select>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} />
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register("description")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" {...register("amount")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Record"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
