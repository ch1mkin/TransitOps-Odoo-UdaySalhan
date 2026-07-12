"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { resolveTheme, useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

interface TruckLoaderProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: {
    shell: "w-44",
    stage: "h-20",
    icon: "h-9 w-[4.75rem]",
    label: "text-xs",
  },
  md: {
    shell: "w-52",
    stage: "h-24",
    icon: "h-11 w-[5.75rem]",
    label: "text-sm",
  },
  lg: {
    shell: "w-64",
    stage: "h-28",
    icon: "h-14 w-[7.25rem]",
    label: "text-sm",
  },
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

function useIsDarkTheme() {
  const mode = useThemeStore((state) => state.mode);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolveTheme(mode) === "dark");

    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setIsDark(resolveTheme("system") === "dark");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  return isDark;
}

function TruckWheel({
  cx,
  cy,
  r,
  spin,
  isDark,
}: {
  cx: number;
  cy: number;
  r: number;
  spin: boolean;
  isDark: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle
        r={r}
        fill={isDark ? "#1e293b" : "#0f172a"}
        stroke={isDark ? "#64748b" : "#334155"}
        strokeWidth="0.8"
      />
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
        <circle
          r={r - 1.75}
          fill="none"
          stroke={isDark ? "#94a3b8" : "#475569"}
          strokeWidth="1"
        />
        <circle
          r={r - 3.25}
          fill="none"
          stroke={isDark ? "#cbd5e1" : "#94a3b8"}
          strokeWidth="1.1"
          strokeDasharray="2.8 2.2"
        />
        <line
          x1="0"
          y1={-(r - 3)}
          x2="0"
          y2={r - 3}
          stroke={isDark ? "#f8fafc" : "#e2e8f0"}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1={-(r - 3)}
          y1="0"
          x2={r - 3}
          y2="0"
          stroke={isDark ? "#f8fafc" : "#e2e8f0"}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle r={r * 0.3} fill={isDark ? "#e2e8f0" : "#f8fafc"} />
        <circle r={r * 0.13} fill={isDark ? "#94a3b8" : "#64748b"} />
      </g>
    </g>
  );
}

function TruckIcon({
  className,
  spinWheels = true,
  isDark = false,
}: {
  className?: string;
  spinWheels?: boolean;
  isDark?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const spin = spinWheels && !reducedMotion;
  const body = isDark ? "#60A5FA" : "#2563EB";
  const cab = isDark ? "#38BDF8" : "#1D4ED8";
  const teal = isDark ? "#2DD4BF" : "#14B8A6";
  const amber = isDark ? "#FBBF24" : "#F59E0B";
  const red = isDark ? "#F87171" : "#EF4444";

  return (
    <svg
      viewBox="0 0 104 46"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="36" y="8" width="56" height="24" rx="2.5" fill={body} />
      <path d="M6 12h24l8 8v14H6V12z" fill={cab} />
      <rect x="10" y="15" width="14" height="11" rx="1.25" fill={teal} fillOpacity="0.55" />
      <rect x="40" y="12" width="46" height="2.5" rx="1" fill={teal} fillOpacity="0.85" />
      <rect x="3" y="21" width="4" height="6" rx="0.75" fill={amber} />
      <rect x="90" y="21" width="4.5" height="7" rx="0.75" fill={red} />
      <rect x="32" y="17" width="2.5" height="15" fill={body} fillOpacity="0.95" />
      <path
        d="M14 28h10M8 28h4"
        stroke={teal}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <TruckWheel cx={23} cy={35} r={7.5} spin={spin} isDark={isDark} />
      <TruckWheel cx={72} cy={35} r={7.5} spin={spin} isDark={isDark} />
    </svg>
  );
}

/** Compact spinner for buttons and inline contexts */
export function TruckLoaderInline({ className }: { className?: string }) {
  const isDark = useIsDarkTheme();

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      aria-hidden
    >
      <TruckIcon className="h-4 w-9" isDark={isDark} />
    </span>
  );
}

export function TruckLoader({
  label = "Loading",
  className,
  size = "md",
}: TruckLoaderProps) {
  const dim = sizeMap[size];
  const isDark = useIsDarkTheme();
  const roadColor = isDark ? "bg-cyan-400/80" : "bg-[#14b8a6]/80";

  return (
    <div
      className={cn("flex items-center justify-center text-center", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "loader-shell relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 px-4 pb-4 pt-3 shadow-sm",
          dim.shell
        )}
      >
        <div className={cn("relative w-full", dim.stage)}>
          <div className="loader-road absolute inset-x-3 bottom-2 h-1 overflow-hidden rounded-full bg-muted">
            <div className={cn("loader-road-fill h-full rounded-full", roadColor)} />
          </div>

          <div className="loader-dashes pointer-events-none absolute inset-x-0 bottom-4 flex gap-4 opacity-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="h-0.5 w-5 shrink-0 rounded-full bg-border" />
            ))}
          </div>

          <div className="loader-truck absolute bottom-2.5 left-1/2">
            <TruckIcon className={dim.icon} isDark={isDark} />
          </div>
        </div>

        <p className={cn("mt-3 font-medium text-foreground", dim.label)}>{label}</p>
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
