import { cn } from "@/lib/utils";

interface ModulePageProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ModulePage({
  title,
  description,
  actions,
  filters,
  children,
  className,
}: ModulePageProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>

      {filters}

      <div className="rounded-xl border border-border bg-card workspace-shadow">
        {children}
      </div>
    </div>
  );
}
