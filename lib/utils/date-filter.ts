/** Returns true when `value` (YYYY-MM-DD or ISO) falls within [from, to] (inclusive). */
export function withinDateRange(
  value: string | null | undefined,
  from: string,
  to: string
): boolean {
  if (!from && !to) return true;
  if (!value) return !from && !to;

  const date = value.slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function getTripFilterDate(trip: {
  dispatch_time?: string | null;
  completion_time?: string | null;
}): string {
  return (trip.completion_time ?? trip.dispatch_time ?? "").slice(0, 10);
}
