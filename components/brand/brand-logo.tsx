import { TransitOpsMark, TransitOpsWordmark } from "@/components/brand/transitops-mark";
import { BRAND } from "@/constants/brand";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "icon" | "full";

interface BrandLogoProps {
  /** `icon` — square mark; `full` — horizontal logo with wordmark */
  variant?: BrandLogoVariant;
  /** Display size in pixels (width; height scales for `full`) */
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = "icon",
  size = 32,
  className,
}: BrandLogoProps) {
  if (variant === "full") {
    return (
      <TransitOpsWordmark
        size={size}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <TransitOpsMark
      size={size}
      className={cn("object-contain", className)}
      aria-label={BRAND.name}
    />
  );
}
