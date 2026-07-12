"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { getNavTitleForPath } from "@/constants/navigation";
import type { Role } from "@/constants/roles";
import { NotificationBell } from "@/components/workspace/notification-bell";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceMobileHeaderProps {
  role: Role;
  userId: string;
}

export function WorkspaceMobileHeader({ role, userId }: WorkspaceMobileHeaderProps) {
  const pathname = usePathname();
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const pageTitle = getNavTitleForPath(pathname, role);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-workspace-bar px-3 md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 text-slate-300 hover:bg-slate-700/50 hover:text-white"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <BrandLogo variant="icon" size={28} className="shrink-0 rounded-md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{pageTitle}</p>
          <p className="truncate text-[10px] text-slate-400">TransitOps workspace</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <ThemeToggle variant="workspace" />
        <NotificationBell userId={userId} variant="mobile-header" />
      </div>
    </header>
  );
}
