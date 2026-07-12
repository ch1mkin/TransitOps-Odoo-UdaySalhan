"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Maximize2, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PopoutContent } from "@/components/workspace/popout-content";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import type { PopoutWindow } from "@/types";

interface PopoutWindowFrameProps {
  popout: PopoutWindow;
}

export function PopoutWindowFrame({ popout }: PopoutWindowFrameProps) {
  const router = useRouter();
  const dockPopout = useWorkspaceStore((s) => s.dockPopout);
  const closePopout = useWorkspaceStore((s) => s.closePopout);
  const minimizePopout = useWorkspaceStore((s) => s.minimizePopout);
  const restorePopout = useWorkspaceStore((s) => s.restorePopout);
  const updatePosition = useWorkspaceStore((s) => s.updatePopoutPosition);
  const bringToFront = useWorkspaceStore((s) => s.bringPopoutToFront);

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const mergeIntoTabs = () => {
    const href = dockPopout(popout.id);
    if (href) {
      router.push(href);
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    bringToFront(popout.id);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: popout.x,
      origY: popout.y,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    updatePosition(popout.id, {
      x: Math.max(0, dragRef.current.origX + dx),
      y: Math.max(0, dragRef.current.origY + dy),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  if (popout.minimized) {
    return (
      <button
        type="button"
        onClick={() => restorePopout(popout.id)}
        className="fixed bottom-4 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium workspace-shadow hover:bg-muted"
        style={{ left: popout.x, zIndex: popout.zIndex }}
      >
        {popout.title}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed flex flex-col overflow-hidden rounded-xl border border-border bg-card popout-shadow",
        isDragging && "select-none"
      )}
      style={{
        left: popout.x,
        top: popout.y,
        width: popout.width,
        height: popout.height,
        zIndex: popout.zIndex,
      }}
      onMouseDown={() => bringToFront(popout.id)}
    >
      <div
        className="flex h-9 cursor-grab items-center justify-between border-b border-border bg-muted/50 px-2 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="flex min-w-0 items-center gap-2 px-1">
          <div className="flex size-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
            T
          </div>
          <span className="truncate text-xs font-semibold">{popout.title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px]"
            onClick={mergeIntoTabs}
            aria-label="Merge into tabs"
          >
            <Maximize2 className="size-3.5" />
            Merge
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => minimizePopout(popout.id)}
            aria-label="Minimize window"
          >
            <Minus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => {
              const href = closePopout(popout.id);
              if (href) router.push(href);
            }}
            aria-label="Merge into tabs and close window"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-background p-3">
        <PopoutContent href={popout.contentKey} compact />
      </div>
    </div>
  );
}

export function PopoutLayer() {
  const popouts = useWorkspaceStore((s) => s.popouts);

  if (popouts.length === 0) return null;

  return (
    <>
      {popouts.map((popout) => (
        <PopoutWindowFrame key={popout.id} popout={popout} />
      ))}
    </>
  );
}
