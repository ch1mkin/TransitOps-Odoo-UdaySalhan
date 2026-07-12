import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error && "border-destructive",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
