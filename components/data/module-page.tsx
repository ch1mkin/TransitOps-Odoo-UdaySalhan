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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>

      {filters}

      <div className="rounded-xl border border-border bg-card workspace-shadow">
        {children}
      </div>
    </div>
  );
}
