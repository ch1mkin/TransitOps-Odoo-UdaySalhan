"use client";

import { cn } from "@/lib/utils";

interface TruckLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { shell: "w-40", road: "h-16", icon: "h-9 w-[4.5rem]", bar: "w-28" },
  md: { shell: "w-48", road: "h-[4.5rem]", icon: "h-11 w-[5.5rem]", bar: "w-36" },
  lg: { shell: "w-60", road: "h-24", icon: "h-14 w-[7rem]", bar: "w-44" },
};

function TruckWheel({
  cx,
  cy,
  r,
  className,
}: {
  cx: number;
  cy: number;
  r: number;
  className?: string;
}) {
  return (
    <g className={cn("loader-wheel", className)} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx} cy={cy} r={r} fill="#111827" />
      <circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke="#374151" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r - 3} fill="none" stroke="#6b7280" strokeWidth="1.25" strokeDasharray="3 2.5" />
      <line x1={cx} y1={cy - r + 4} x2={cx} y2={cy + r - 4} stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={cx - r + 4} y1={cy} x2={cx + r - 4} y2={cy} stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      <line
        x1={cx - (r - 5) * 0.7}
        y1={cy - (r - 5) * 0.7}
        x2={cx + (r - 5) * 0.7}
        y2={cy + (r - 5) * 0.7}
        stroke="#9ca3af"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1={cx - (r - 5) * 0.7}
        y1={cy + (r - 5) * 0.7}
        x2={cx + (r - 5) * 0.7}
        y2={cy - (r - 5) * 0.7}
        stroke="#9ca3af"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#f3f4f6" />
      <circle cx={cx} cy={cy} r={r * 0.12} fill="#9ca3af" />
    </g>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 44"
      className={cn("text-primary", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="34" y="9" width="54" height="23" rx="2.5" fill="currentColor" />
      <path d="M8 13h22l7 7v12H8V13z" fill="currentColor" />
      <rect x="12" y="16" width="13" height="10" rx="1.25" fill="white" fillOpacity="0.42" />
      <rect x="38" y="13" width="44" height="2" rx="1" fill="white" fillOpacity="0.18" />
      <rect x="5" y="22" width="3.5" height="5" rx="0.75" fill="#FBBF24" />
      <rect x="86" y="22" width="4" height="6" rx="0.75" fill="#EF4444" />
      <rect x="30" y="18" width="2" height="14" fill="currentColor" fillOpacity="0.85" />
      <TruckWheel cx={22} cy={34} r={7} />
      <TruckWheel cx={70} cy={34} r={7} />
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
      <TruckIcon className="h-4 w-9" />
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

        <div className="loader-dashes pointer-events-none absolute inset-x-0 bottom-5 flex gap-4 opacity-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-0.5 w-5 shrink-0 rounded-full bg-border" />
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

/** Centers the loader vertically and horizontally within a loading section */
export function TruckLoaderSection({
  label = "Loading…",
  size = "md",
  className,
}: TruckLoaderProps) {
  return (
    <div
      className={cn(
        "flex w-full min-h-[min(56vh,420px)] items-center justify-center px-6 py-12",
        className
      )}
    >
      <TruckLoader label={label} size={size} />
    </div>
  );
}

export function TruckLoaderOverlay({
  label = "Loading workspace",
  className,
}: TruckLoaderProps) {
  return (
    <TruckLoaderSection
      label={label}
      size="lg"
      className={cn("min-h-[calc(100dvh-10.5rem)]", className)}
    />
  );
}
