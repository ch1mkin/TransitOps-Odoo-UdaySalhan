"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  PanelLeft,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNavForRole, PROFILE_NAV } from "@/constants/navigation";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { useOpenModule, useOpenWorkspaceTab } from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/store/workspace-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface WorkspaceSidebarProps {
  role: Role;
  userName: string;
}

export function WorkspaceSidebar({ role, userName }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const collapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const openModule = useOpenModule();
  const openTab = useOpenWorkspaceTab();
  const navItems = getNavForRole(role);

  const handleNavClick = (title: string, href: string) => {
    openTab(title, href, { type: "route" });
    router.push(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    useWorkspaceStore.getState().resetWorkspace();
    router.push("/auth");
    router.refresh();
  };

  const openProfile = () => {
    openModule("Profile", "profile", "user-profile", {
      ephemeral: true,
      width: 400,
      metadata: { userName, role },
    });
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border px-3">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">TransitOps</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {ROLE_LABELS[role]}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <PanelLeft className="size-4" />
          </Button>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavClick(item.title, item.href)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </button>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-border p-2">
        <button
          type="button"
          onClick={openProfile}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? PROFILE_NAV.title : undefined}
        >
          <PROFILE_NAV.icon className="size-4 shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {userName || "Profile"}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {collapsed && (
          <div className="flex justify-center pt-1">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
