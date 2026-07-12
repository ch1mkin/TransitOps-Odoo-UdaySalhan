"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RowActionsProps {
  onOpen: () => void;
  onPopout: () => void;
  openLabel?: string;
  popoutLabel?: string;
  className?: string;
}

export function RowActions({
  onOpen,
  onPopout,
  openLabel = "Open record",
  popoutLabel = "Pop out",
  className,
}: RowActionsProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-1", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={onPopout}
        aria-label={popoutLabel}
        title={popoutLabel}
      >
        <ExternalLink className="size-3.5" />
      </Button>
    </div>
  );
}
