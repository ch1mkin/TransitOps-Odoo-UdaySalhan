"use client";

import { cn } from "@/lib/utils";

interface TruckLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    shell: "w-44 gap-2.5",
    track: "h-1",
    label: "text-xs",
  },
  md: {
    shell: "w-52 gap-3",
    track: "h-1.5",
    label: "text-sm",
  },
  lg: {
    shell: "w-64 gap-3.5",
    track: "h-2",
    label: "text-sm",
  },
};

function LoaderBar({
  trackClassName,
  barClassName,
}: {
  trackClassName?: string;
  barClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-muted/80",
        trackClassName
      )}
      aria-hidden
    >
      <div
        className={cn(
          "loader-bar-travel absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-accent/70 via-accent to-cyan-400",
          barClassName
        )}
      />
    </div>
  );
}

/** Compact spinner for buttons and inline contexts */
export function TruckLoaderInline({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      aria-hidden
    >
      <LoaderBar trackClassName="h-1 w-10" barClassName="w-1/2" />
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
      className={cn("flex items-center justify-center text-center", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "flex w-full flex-col items-center rounded-2xl border border-border/80 bg-card/90 px-5 py-4 backdrop-blur-sm workspace-shadow",
          dim.shell
        )}
      >
        <LoaderBar trackClassName={cn("w-full", dim.track)} />
        <p className={cn("font-medium text-foreground", dim.label)}>{label}</p>
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
  label = "Loading…",
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
