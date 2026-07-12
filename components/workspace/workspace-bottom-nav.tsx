"use client";

import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import {
  getActiveNavHref,
  getMobileBottomNavItems,
} from "@/constants/navigation";
import type { Role } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceBottomNavProps {
  role: Role;
}

export function WorkspaceBottomNav({ role }: WorkspaceBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const setSidebarOpen = useWorkspaceStore((state) => state.setSidebarOpen);
  const items = getMobileBottomNavItems(role);
  const activeNavHref = getActiveNavHref(pathname, items);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      aria-label="Primary navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeNavHref;

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("size-5 shrink-0", isActive && "stroke-[2.5]")} />
              <span className="max-w-full truncate px-0.5">
                {item.title === "Notifications"
                  ? "Alerts"
                  : item.title === "Dashboard"
                    ? "Home"
                    : item.title.split(" ")[0]}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="size-5 shrink-0" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
