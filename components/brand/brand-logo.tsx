import Image from "next/image";
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

const aspectRatio: Record<BrandLogoVariant, number> = {
  icon: 1,
  full: 200 / 48,
};

export function BrandLogo({
  variant = "icon",
  size = 32,
  className,
  priority = false,
}: BrandLogoProps) {
  const src = variant === "full" ? BRAND.logo : BRAND.logoIcon;
  const width = size;
  const height = Math.round(size / aspectRatio[variant]);

  return (
    <Image
      src={src}
      alt={BRAND.name}
      width={width}
      height={height}
      className={cn("object-contain", className)}
      priority={priority}
    />
  );
}
