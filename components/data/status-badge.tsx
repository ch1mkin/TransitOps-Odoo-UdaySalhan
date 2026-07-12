import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Trip": "bg-blue-50 text-blue-700 border-blue-200",
  "In Shop": "bg-amber-50 text-amber-700 border-amber-200",
  Retired: "bg-slate-100 text-slate-600 border-slate-200",
  "Off Duty": "bg-slate-100 text-slate-600 border-slate-200",
  Suspended: "bg-red-50 text-red-700 border-red-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Dispatched: "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
        statusStyles[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      {status}
    </span>
  );
}
