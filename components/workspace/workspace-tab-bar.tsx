"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import type { WorkspaceTab } from "@/types";

function SortableTab({
  tab,
  isActive,
  isPoppedOut,
}: {
  tab: WorkspaceTab;
  isActive: boolean;
  isPoppedOut: boolean;
}) {
  const router = useRouter();
  const closeTab = useWorkspaceStore((s) => s.closeTab);
  const setActiveTab = useWorkspaceStore((s) => s.setActiveTab);
  const popoutTab = useWorkspaceStore((s) => s.popoutTab);
  const dockPopoutForTab = useWorkspaceStore((s) => s.dockPopoutForTab);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleActivate = () => {
    if (isPoppedOut) {
      const href = dockPopoutForTab(tab.id);
      setActiveTab(tab.id);
      router.push(href ?? tab.href);
      return;
    }

    setActiveTab(tab.id);
    router.push(tab.href);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex h-8 max-w-[220px] min-w-[120px] shrink-0 items-center gap-1.5 rounded-t-lg border border-b-0 px-2.5 text-xs transition-colors",
        isActive
          ? "z-10 border-border bg-workspace-tab-active text-foreground workspace-shadow"
          : "border-transparent bg-workspace-tab text-muted-foreground hover:bg-slate-200/70",
        isPoppedOut && !isActive && "ring-1 ring-accent/30",
        isDragging && "z-50 opacity-80 shadow-lg"
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 active:cursor-grabbing"
        onClick={handleActivate}
        onDoubleClick={() => popoutTab(tab.id)}
        title={
          isPoppedOut
            ? "Click to merge into main view · Double-click to focus pop-out"
            : "Click to open · Double-click to pop out"
        }
        {...attributes}
        {...listeners}
      >
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
          {tab.title.charAt(0).toUpperCase()}
        </span>
        <span className="truncate font-medium">{tab.title}</span>
        {isPoppedOut ? (
          <ExternalLink className="size-3 shrink-0 text-accent" aria-hidden />
        ) : null}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.id);
        }}
        className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        aria-label={`Close ${tab.title}`}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

export function WorkspaceTabBar() {
  const tabs = useWorkspaceStore((s) => s.tabs);
  const activeTabId = useWorkspaceStore((s) => s.activeTabId);
  const popouts = useWorkspaceStore((s) => s.popouts);
  const reorderTabs = useWorkspaceStore((s) => s.reorderTabs);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTabs(String(active.id), String(over.id));
    }
  };

  const poppedOutTabIds = new Set(popouts.map((p) => p.tabId));

  if (tabs.length === 0) {
    return (
      <div className="flex h-9 items-center border-b border-border bg-workspace-tab px-4">
        <p className="text-[11px] text-muted-foreground">
          Open a driver, vehicle, trip, or profile to pin it here — tabs stay until you close them
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-9 items-end gap-0.5 overflow-x-auto border-b border-border bg-workspace-tab px-2 scrollbar-none">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tabs.map((t) => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          {tabs.map((tab) => (
            <SortableTab
              key={tab.id}
              tab={tab}
              isActive={activeTabId === tab.id}
              isPoppedOut={poppedOutTabIds.has(tab.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
