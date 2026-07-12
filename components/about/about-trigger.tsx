"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ABOUT } from "@/constants/about";
import { cn } from "@/lib/utils";

interface AboutTriggerProps {
  variant?: "default" | "workspace";
  className?: string;
}

export function AboutTrigger({ variant = "default", className }: AboutTriggerProps) {
  const [open, setOpen] = useState(false);
  const isWorkspace = variant === "workspace";

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          isWorkspace
            ? "h-7 gap-1.5 px-2 text-[11px] font-medium normal-case tracking-normal text-slate-300 hover:bg-slate-700/50 hover:text-white"
            : "gap-1.5",
          className
        )}
      >
        <Info className={cn("shrink-0", isWorkspace ? "size-3.5" : "size-4")} />
        About
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="About TransitOps"
        description="Hackathon project overview"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <BrandLogo variant="icon" size={48} className="rounded-lg" />
            <div>
              <p className="text-sm font-semibold">{ABOUT.product}</p>
              <p className="text-xs text-muted-foreground">
                {ABOUT.event} · {ABOUT.theme}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {ABOUT.product} was built by{" "}
            <span className="font-medium text-foreground">{ABOUT.builder}</span> for{" "}
            <span className="font-medium text-foreground">{ABOUT.event}</span>.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {ABOUT.problem.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{ABOUT.problem.summary}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {ABOUT.solution.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{ABOUT.solution.summary}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
            {ABOUT.stack}
          </div>
        </div>
      </Dialog>
    </>
  );
}
