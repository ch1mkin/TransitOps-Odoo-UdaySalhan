interface FleetDataErrorProps {
  title?: string;
  message: string;
}

export function FleetDataError({
  title = "Could not load fleet data",
  message,
}: FleetDataErrorProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="text-lg font-semibold text-destructive">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Run migrations{" "}
        <code className="rounded bg-muted px-1 py-0.5">003_fleet_seed.sql</code>{" "}
        and{" "}
        <code className="rounded bg-muted px-1 py-0.5">
          004_fleet_rls_trips_seed.sql
        </code>{" "}
        in the Supabase SQL Editor if you have not already.
      </p>
    </div>
  );
}
