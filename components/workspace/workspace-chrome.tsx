"use client";

import { useEnsureWorkspaceTab, useWorkspaceNavigation } from "@/hooks/use-workspace";
import { WorkspaceWalkthrough } from "@/components/walkthrough/workspace-walkthrough";
import { RouteGuard } from "@/components/access/route-guard";
import { LicenseAlertSync } from "@/components/compliance/license-alert-sync";
import { LinkedWorkspaceHeader } from "./linked-workspace-header";
import { ModulePanelRail } from "./module-panel";
import { PopoutLayer } from "./popout-window";
import { WorkspaceBottomNav } from "./workspace-bottom-nav";
import { WorkspaceMobileDrawer } from "./workspace-mobile-drawer";
import { WorkspaceMobileHeader } from "./workspace-mobile-header";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import type { Role } from "@/constants/roles";

interface WorkspaceChromeProps {
  children: React.ReactNode;
  role: Role;
  userName: string;
  userId: string;
}

export function WorkspaceChrome({
  children,
  role,
  userName,
  userId,
}: WorkspaceChromeProps) {
  useWorkspaceNavigation();
  useEnsureWorkspaceTab({ profileTitle: userName, profileUserId: userId });

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <WorkspaceWalkthrough userId={userId} role={role} />
      <LicenseAlertSync role={role} />

      <div className="hidden md:block">
        <LinkedWorkspaceHeader userId={userId} />
      </div>
      <WorkspaceMobileHeader role={role} userId={userId} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <WorkspaceSidebar role={role} userName={userName} userId={userId} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <WorkspaceTabBar />

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <main
              data-walkthrough="main-content"
              className="mobile-main min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background p-3 pb-20 sm:p-4 sm:pb-20 md:p-6 md:pb-6"
            >
              <RouteGuard role={role}>{children}</RouteGuard>
            </main>
            <div className="hidden lg:flex">
              <ModulePanelRail />
            </div>
          </div>
        </div>
      </div>

      <WorkspaceBottomNav role={role} />
      <WorkspaceMobileDrawer role={role} userName={userName} userId={userId} />
      <PopoutLayer />
    </div>
  );
}
