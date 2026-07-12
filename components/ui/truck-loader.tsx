"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface TruckLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { shell: "w-40", road: "h-16", icon: "h-9 w-[4.75rem]", bar: "w-28" },
  md: { shell: "w-48", road: "h-[4.5rem]", icon: "h-11 w-[5.75rem]", bar: "w-36" },
  lg: { shell: "w-60", road: "h-24", icon: "h-14 w-[7.25rem]", bar: "w-44" },
};

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

function TruckWheel({
  cx,
  cy,
  r,
  spin,
}: {
  cx: number;
  cy: number;
  r: number;
  spin: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
      <g>
        {spin ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="0.5s"
            repeatCount="indefinite"
          />
        ) : null}
        <circle r={r - 1.75} fill="none" stroke="#475569" strokeWidth="1" />
        <circle
          r={r - 3.25}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.1"
          strokeDasharray="2.8 2.2"
        />
        <line
          x1="0"
          y1={-(r - 3)}
          x2="0"
          y2={r - 3}
          stroke="#e2e8f0"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1={-(r - 3)}
          y1="0"
          x2={r - 3}
          y2="0"
          stroke="#e2e8f0"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1={-(r - 3.5) * 0.72}
          y1={-(r - 3.5) * 0.72}
          x2={(r - 3.5) * 0.72}
          y2={(r - 3.5) * 0.72}
          stroke="#cbd5e1"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <line
          x1={-(r - 3.5) * 0.72}
          y1={(r - 3.5) * 0.72}
          x2={(r - 3.5) * 0.72}
          y2={-(r - 3.5) * 0.72}
          stroke="#cbd5e1"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle r={r * 0.3} fill="#f8fafc" />
        <circle r={r * 0.13} fill="#64748b" />
      </g>
    </g>
  );
}

function TruckIcon({
  className,
  spinWheels = true,
}: {
  className?: string;
  spinWheels?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const spin = spinWheels && !reducedMotion;

  return (
    <svg
      viewBox="0 0 104 46"
      className={cn("text-[#0f2744]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="36" y="8" width="56" height="24" rx="2.5" fill="currentColor" />
      <path d="M6 12h24l8 8v14H6V12z" fill="currentColor" />
      <rect x="10" y="15" width="14" height="11" rx="1.25" fill="#14b8a6" fillOpacity="0.35" />
      <rect x="40" y="12" width="46" height="2.5" rx="1" fill="#14b8a6" fillOpacity="0.55" />
      <rect x="3" y="21" width="4" height="6" rx="0.75" fill="#14b8a6" />
      <rect x="90" y="21" width="4.5" height="7" rx="0.75" fill="#ef4444" />
      <rect x="32" y="17" width="2.5" height="15" fill="currentColor" fillOpacity="0.9" />
      <path
        d="M14 28h10M8 28h4"
        stroke="#14b8a6"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <TruckWheel cx={23} cy={35} r={7.5} spin={spin} />
      <TruckWheel cx={72} cy={35} r={7.5} spin={spin} />
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
          <div className="loader-road-fill h-full rounded-full bg-[#14b8a6]/80" />
        </div>

        <div className="loader-dashes pointer-events-none absolute inset-x-0 bottom-5 flex gap-4 opacity-50">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="h-0.5 w-5 shrink-0 rounded-full bg-border" />
          ))}
        </div>

        <div className="loader-truck absolute bottom-3.5 left-1/2">
          <TruckIcon className={dim.icon} />
        </div>
      </div>

      <div className="space-y-2">
        <p className={cn("font-medium text-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {label}
        </p>
        <div className={cn("mx-auto h-1 overflow-hidden rounded-full bg-muted", dim.bar)}>
          <div className="loader-bar h-full rounded-full bg-[#14b8a6]" />
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
