"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  getActiveNavHref,
  getMobileMenuNavItems,
  getNavForRole,
  PROFILE_NAV,
} from "@/constants/navigation";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { useProfileTab } from "@/hooks/use-entity-tab";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceMobileDrawerProps {
  role: Role;
  userName: string;
  userId: string;
}

export function WorkspaceMobileDrawer({
  role,
  userName,
  userId,
}: WorkspaceMobileDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const open = useWorkspaceStore((state) => state.sidebarOpen);
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const openProfileTab = useProfileTab();
  const menuItems = getMobileMenuNavItems(role);
  const allItems = getNavForRole(role);
  const activeNavHref = getActiveNavHref(pathname, allItems);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => setSidebarOpen(false);

  const navigate = (href: string) => {
    close();
    router.push(href);
  };

  const handleLogout = async () => {
    close();
    const supabase = createClient();
    await supabase.auth.signOut();
    useWorkspaceStore.getState().resetWorkspace();
    router.push("/auth");
    router.refresh();
  };

  const openProfile = () => {
    close();
    openProfileTab(userName || "Profile", userId);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close menu"
        onClick={close}
      />
      <aside className="absolute inset-y-0 left-0 flex w-[min(100vw-3rem,20rem)] flex-col bg-card shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-2">
            <BrandLogo variant="icon" size={32} className="shrink-0 rounded-lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">TransitOps</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {ROLE_LABELS[role]}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Close menu">
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activeNavHref;

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </button>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={openProfile}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              pathname === "/profile"
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            )}
          >
            <PROFILE_NAV.icon className="size-4 shrink-0" />
            <span className="truncate">{userName || PROFILE_NAV.title}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
