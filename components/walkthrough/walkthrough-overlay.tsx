"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WalkthroughPlacement, WalkthroughStep } from "@/lib/walkthrough/steps";
import { cn } from "@/lib/utils";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface WalkthroughOverlayProps {
  step: WalkthroughStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const PADDING = 10;

function getTooltipPosition(
  rect: TargetRect,
  placement: WalkthroughPlacement,
  tooltipWidth: number,
  tooltipHeight: number
) {
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = rect.top + rect.height / 2 - tooltipHeight / 2;
  let left = rect.left + rect.width / 2 - tooltipWidth / 2;

  switch (placement) {
    case "right":
      left = rect.left + rect.width + gap;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      break;
    case "left":
      left = rect.left - tooltipWidth - gap;
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
      break;
    case "bottom":
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
    case "top":
      top = rect.top - tooltipHeight - gap;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
      break;
  }

  left = Math.max(12, Math.min(left, vw - tooltipWidth - 12));
  top = Math.max(12, Math.min(top, vh - tooltipHeight - 12));

  return { top, left };
}

function ArrowIcon({ placement }: { placement: WalkthroughPlacement }) {
  const className = "size-5 text-accent";
  switch (placement) {
    case "top":
      return <ArrowDown className={className} />;
    case "bottom":
      return <ArrowUp className={className} />;
    case "left":
      return <ArrowRight className={className} />;
    case "right":
      return <ArrowLeft className={className} />;
  }
}

export function WalkthroughOverlay({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
}: WalkthroughOverlayProps) {
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 180 });
  const isLast = stepIndex >= totalSteps - 1;

  const measureTarget = useCallback(() => {
    const el = document.querySelector(step.target);
    if (!el) {
      setRect(null);
      return;
    }

    el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });

    const bounds = el.getBoundingClientRect();
    setRect({
      top: bounds.top - PADDING,
      left: bounds.left - PADDING,
      width: bounds.width + PADDING * 2,
      height: bounds.height + PADDING * 2,
    });
  }, [step.target]);

  useLayoutEffect(() => {
    measureTarget();
    const timer = window.setTimeout(measureTarget, 120);
    return () => window.clearTimeout(timer);
  }, [measureTarget, step.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSkip();
      if (event.key === "Enter") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onSkip]);

  useEffect(() => {
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget]);

  const tooltipPos =
    rect != null
      ? getTooltipPosition(rect, step.placement, tooltipSize.width, tooltipSize.height)
      : { top: window.innerHeight / 2 - 90, left: window.innerWidth / 2 - 160 };

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal aria-label="Workspace tour">
      <div className="fixed inset-0 z-[199] bg-transparent" aria-hidden />

      {rect ? (
        <div
          className="walkthrough-spotlight pointer-events-none fixed rounded-xl ring-2 ring-accent ring-offset-2 ring-offset-transparent"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.62)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/60" />
      )}

      <div
        ref={(node) => {
          if (!node) return;
          const { width, height } = node.getBoundingClientRect();
          if (width !== tooltipSize.width || height !== tooltipSize.height) {
            setTooltipSize({ width, height });
          }
        }}
        className="fixed z-[201] w-[min(100vw-24px,22rem)] rounded-xl border border-border bg-card p-4 shadow-2xl"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {rect ? (
          <div
            className={cn(
              "absolute flex text-accent",
              step.placement === "right" && "-left-7 top-1/2 -translate-y-1/2",
              step.placement === "left" && "-right-7 top-1/2 -translate-y-1/2",
              step.placement === "bottom" && "left-1/2 top-0 -translate-x-1/2 -translate-y-full",
              step.placement === "top" && "bottom-0 left-1/2 -translate-x-1/2 translate-y-full"
            )}
            aria-hidden
          >
            <ArrowIcon placement={step.placement} />
          </div>
        ) : null}

        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
            Skip tour
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            {isLast ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
