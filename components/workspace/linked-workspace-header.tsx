"use client";

import { Network } from "lucide-react";
import { AboutTrigger } from "@/components/about/about-trigger";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/workspace/notification-bell";

interface LinkedWorkspaceHeaderProps {
  userId: string;
}

export function LinkedWorkspaceHeader({ userId }: LinkedWorkspaceHeaderProps) {
  return (
    <div
      className="flex h-8 items-center gap-2 bg-workspace-bar px-3 text-[11px] font-medium uppercase tracking-widest text-slate-400"
      data-walkthrough="workspace-header"
    >
      <Network className="size-3.5 text-amber-400" />
      <span>Linked Workspace</span>
      <div className="ml-2 flex-1 border-b border-dashed border-slate-600/60" />
      <ThemeToggle variant="workspace" />
      <AboutTrigger variant="workspace" />
      <NotificationBell userId={userId} />
    </div>
  );
}
