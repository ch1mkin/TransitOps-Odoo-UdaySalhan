import type { TripUpdate } from "@/types/entities";

interface TripUpdatesTimelineProps {
  updates: TripUpdate[];
}

const EVENT_LABELS: Record<string, string> = {
  created: "Created",
  dispatched: "Dispatched",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function TripUpdatesTimeline({ updates }: TripUpdatesTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Activity</h3>
        <p className="mt-2 text-sm text-muted-foreground">No trip updates recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Activity</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Trip lifecycle events</p>
      </div>
      <ol className="divide-y divide-border">
        {updates.map((update) => (
          <li key={update.id} className="flex gap-3 px-4 py-3">
            <div className="mt-1 size-2 shrink-0 rounded-full bg-accent" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {EVENT_LABELS[update.event_type] ?? update.event_type}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(update.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm">{update.message}</p>
              {update.actor_name ? (
                <p className="mt-1 text-xs text-muted-foreground">by {update.actor_name}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
