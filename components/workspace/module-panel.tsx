"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { useWorkspaceStore } from "@/store/workspace-store";
import { cn } from "@/lib/utils";
import type { ModulePanel } from "@/types";

function ModuleContent({ module }: { module: ModulePanel }) {
  switch (module.type) {
    case "profile": {
      const userName = (module.metadata?.userName as string) ?? "User";
      const role = (module.metadata?.role as Role) ?? "fleet_manager";
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm text-muted-foreground">
                {ROLE_LABELS[role]}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            Profile settings and account details will appear here.
          </div>
        </div>
      );
    }
    case "filters":
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Filter controls for the current view.
        </div>
      );
    case "details":
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Entity details panel.
        </div>
      );
    case "form":
      return (
        <div className="p-4 text-sm text-muted-foreground">
          Collapsible form module.
        </div>
      );
    default:
      return null;
  }
}

function ModulePanelItem({ module }: { module: ModulePanel }) {
  const closeModule = useWorkspaceStore((s) => s.closeModule);
  const toggleCollapsed = useWorkspaceStore((s) => s.toggleModuleCollapsed);

  return (
    <div
      className="flex shrink-0 flex-col border-l border-border bg-card workspace-shadow"
      style={{ width: module.collapsed ? 48 : module.width }}
    >
      <div
        className={cn(
          "flex h-10 items-center justify-between border-b border-border px-2",
          module.collapsed && "flex-col justify-center gap-1 py-2 h-auto"
        )}
      >
        {!module.collapsed && (
          <span className="truncate px-1 text-xs font-semibold">
            {module.title}
          </span>
        )}
        <div className={cn("flex items-center gap-0.5", module.collapsed && "flex-col")}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => toggleCollapsed(module.id)}
            aria-label={module.collapsed ? "Expand module" : "Collapse module"}
          >
            {module.collapsed ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => closeModule(module.id)}
            aria-label="Close module"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {!module.collapsed && (
        <div className="flex-1 overflow-y-auto">
          <ModuleContent module={module} />
        </div>
      )}
    </div>
  );
}

export function ModulePanelRail() {
  const modules = useWorkspaceStore((s) => s.modules);

  if (modules.length === 0) return null;

  return (
    <div className="flex h-full shrink-0">
      {modules.map((module) => (
        <ModulePanelItem key={module.id} module={module} />
      ))}
    </div>
  );
}
