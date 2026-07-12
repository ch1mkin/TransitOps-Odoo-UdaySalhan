"use client";

import { cn } from "@/lib/utils";

interface TruckLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { shell: "w-36", road: "h-14", icon: "h-7 w-14", bar: "w-24" },
  md: { shell: "w-44", road: "h-16", icon: "h-8 w-16", bar: "w-32" },
  lg: { shell: "w-56", road: "h-20", icon: "h-10 w-20", bar: "w-40" },
};

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 40"
      className={cn("text-primary", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="4" y="12" width="34" height="16" rx="2.5" fill="currentColor" />
      <path d="M38 16h14l8 8v4H38V16z" fill="currentColor" />
      <rect x="8" y="15" width="10" height="7" rx="1" fill="white" fillOpacity="0.35" />
      <rect x="62" y="20" width="4" height="5" rx="0.5" fill="#F59E0B" />
      <g className="loader-wheel loader-wheel-a">
        <circle cx="18" cy="30" r="6" fill="#111827" />
        <circle cx="18" cy="30" r="2.5" fill="#FAFAFA" />
      </g>
      <g className="loader-wheel loader-wheel-b">
        <circle cx="50" cy="30" r="6" fill="#111827" />
        <circle cx="50" cy="30" r="2.5" fill="#FAFAFA" />
      </g>
    </svg>
  );
}

/** Compact spinner for buttons and inline contexts */
export function TruckLoaderInline({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      aria-hidden
    >
      <TruckIcon className="h-4 w-8 animate-pulse" />
    </span>
  );
}

export function TruckLoader({
  label = "Loading",
  className,
  size = "md",
}: TruckLoaderProps) {
  const dim = sizeMap[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "loader-shell relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 shadow-sm",
          dim.shell,
          dim.road
        )}
      >
        <div className="loader-road absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-muted">
          <div className="loader-road-fill h-full rounded-full bg-accent/80" />
        </div>

        <div className="loader-dashes pointer-events-none absolute inset-x-0 bottom-5 flex gap-4 opacity-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="h-px w-6 shrink-0 bg-border" />
          ))}
        </div>

        <div className="loader-truck absolute bottom-4 left-1/2 -translate-x-1/2">
          <TruckIcon className={dim.icon} />
        </div>
      </div>

      <div className="space-y-2">
        <p className={cn("font-medium text-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {label}
        </p>
        <div
          className={cn(
            "mx-auto h-1 overflow-hidden rounded-full bg-muted",
            dim.bar
          )}
        >
          <div className="loader-bar h-full rounded-full bg-accent" />
        </div>
      </div>
    </div>
  );
}

export function TruckLoaderOverlay({ label = "Loading workspace" }: { label?: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6 py-12">
      <TruckLoader label={label} size="lg" />
    </div>
  );
}
