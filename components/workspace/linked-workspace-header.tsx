"use client";

import { Network } from "lucide-react";

export function LinkedWorkspaceHeader() {
  return (
    <div className="flex h-8 items-center gap-2 bg-workspace-bar px-3 text-[11px] font-medium uppercase tracking-widest text-slate-400">
      <Network className="size-3.5 text-amber-400" />
      <span>Linked Workspace</span>
      <div className="ml-2 flex-1 border-b border-dashed border-slate-600/60" />
    </div>
  );
}
