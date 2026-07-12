"use client";

import { cn } from "@/lib/utils";

interface TruckLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-10 w-20",
  md: "h-14 w-28",
  lg: "h-20 w-40",
};

export function TruckLoader({
  label = "Loading…",
  className,
  size = "md",
}: TruckLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={cn("relative", sizes[size])}>
        <svg
          viewBox="0 0 120 60"
          className="h-full w-full text-primary"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="8" y="18" width="52" height="24" rx="3" fill="currentColor" opacity="0.9" />
          <path d="M60 24h22l12 12v6H60V24z" fill="currentColor" opacity="0.9" />
          <rect x="14" y="22" width="16" height="10" rx="1.5" fill="#FAFAFA" opacity="0.35" />
          <g>
            <circle cx="30" cy="46" r="9" fill="#111827" />
            <circle cx="30" cy="46" r="4" fill="#FAFAFA" />
            <line x1="30" y1="37" x2="30" y2="55" stroke="#6B7280" strokeWidth="1.5" />
            <line x1="21" y1="46" x2="39" y2="46" stroke="#6B7280" strokeWidth="1.5" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 30 46"
              to="360 30 46"
              dur="0.85s"
              repeatCount="indefinite"
            />
          </g>
          <g>
            <circle cx="78" cy="46" r="9" fill="#111827" />
            <circle cx="78" cy="46" r="4" fill="#FAFAFA" />
            <line x1="78" y1="37" x2="78" y2="55" stroke="#6B7280" strokeWidth="1.5" />
            <line x1="69" y1="46" x2="87" y2="46" stroke="#6B7280" strokeWidth="1.5" />
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 78 46"
              to="360 78 46"
              dur="0.85s"
              repeatCount="indefinite"
            />
          </g>
          <rect x="94" y="30" width="6" height="8" rx="1" fill="#F59E0B" />
        </svg>
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 overflow-hidden rounded-full bg-border">
          <div className="truck-road h-full w-1/3 rounded-full bg-accent/60" />
        </div>
      </div>
      <p className={cn("text-sm font-medium text-muted-foreground", !label && "sr-only")}>
        {label || "Loading"}
      </p>
    </div>
  );
}

export function TruckLoaderOverlay({
  label = "Loading workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <TruckLoader label={label} size="lg" />
    </div>
  );
}
