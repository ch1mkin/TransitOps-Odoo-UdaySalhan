"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Render at document.body so nested modals do not close parent dialogs. */
  portal?: boolean;
  /** Raise stacking order for dialogs opened above another modal. */
  stackLevel?: "default" | "nested";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  portal = false,
  stackLevel = "default",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const content = (
    <dialog
      ref={dialogRef}
      className={cn(
        "fixed inset-0 m-auto w-[min(100%,32rem)] max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-black/50 open:flex open:flex-col",
        stackLevel === "nested" ? "z-[60]" : "z-50",
        className
      )}
      onClose={(event) => {
        event.stopPropagation();
        if (event.target === dialogRef.current) {
          onOpenChange(false);
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
    >
      <div className="flex items-start justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="overflow-y-auto px-5 py-4">{children}</div>
    </dialog>
  );

  if (portal && mounted) {
    return createPortal(content, document.body);
  }

  return content;
}
