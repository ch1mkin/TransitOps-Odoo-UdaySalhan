import { cn } from "@/lib/utils";

interface TransitOpsMarkProps {
  className?: string;
  size?: number;
}

/** Vibrant transport mark — readable on light and dark backgrounds. */
export function TransitOpsMark({ className, size = 48 }: TransitOpsMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="TransitOps"
    >
      <defs>
        <linearGradient id="transitops-bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="55%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
        <linearGradient id="transitops-road" x1="12" y1="44" x2="52" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id="transitops-cab" x1="16" y1="24" x2="34" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#transitops-bg)" />
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />

      <path
        d="M12 42h40"
        stroke="url(#transitops-road)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M18 42h6M30 42h6M42 42h6"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <rect x="34" y="24" width="22" height="14" rx="3" fill="#1E3A8A" fillOpacity="0.92" />
      <path d="M14 28h16l5 5v9H14V28z" fill="#1E3A8A" fillOpacity="0.95" />
      <path d="M17 31h10v7H17z" fill="url(#transitops-cab)" />
      <rect x="37" y="27" width="16" height="3" rx="1.5" fill="#FBBF24" />
      <rect x="12" y="33" width="3" height="5" rx="1" fill="#FBBF24" />
      <rect x="52" y="33" width="3" height="5" rx="1" fill="#F87171" />

      <circle cx="24" cy="42" r="5" fill="#0F172A" />
      <circle cx="24" cy="42" r="2.2" fill="#E2E8F0" />
      <circle cx="44" cy="42" r="5" fill="#0F172A" />
      <circle cx="44" cy="42" r="2.2" fill="#E2E8F0" />

      <path
        d="M46 18l8 4-8 4"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 22h12"
        stroke="#FDE68A"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface TransitOpsWordmarkProps {
  className?: string;
  size?: number;
}

export function TransitOpsWordmark({ className, size = 32 }: TransitOpsWordmarkProps) {
  const height = size;
  const width = Math.round(size * 4.2);

  return (
    <svg
      viewBox="0 0 168 40"
      width={width}
      height={height}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="TransitOps"
    >
      <defs>
        <linearGradient id="transitops-word" x1="0" y1="0" x2="168" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="29"
        fill="url(#transitops-word)"
        fontSize="24"
        fontWeight="700"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
      >
        TransitOps
      </text>
    </svg>
  );
}
