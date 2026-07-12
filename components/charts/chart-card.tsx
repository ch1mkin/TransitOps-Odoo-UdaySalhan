import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}

export function ChartCard({
  title,
  description,
  children,
  className,
  footer,
  empty = false,
  emptyMessage = "Not enough data yet.",
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card workspace-shadow",
        className
      )}
    >
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="min-h-[260px] flex-1 px-2 py-3">
        {empty ? (
          <div className="flex h-[240px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
      {footer ? (
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
