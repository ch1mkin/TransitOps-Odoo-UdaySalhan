"use client";

import { useWorkspaceNavigation } from "@/hooks/use-workspace";
import { LinkedWorkspaceHeader } from "./linked-workspace-header";
import { ModulePanelRail } from "./module-panel";
import { PopoutLayer } from "./popout-window";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceTabBar } from "./workspace-tab-bar";
import type { Role } from "@/constants/roles";

interface WorkspaceChromeProps {
  children: React.ReactNode;
  role: Role;
  userName: string;
}

export function WorkspaceChrome({
  children,
  role,
  userName,
}: WorkspaceChromeProps) {
  useWorkspaceNavigation();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <LinkedWorkspaceHeader />

      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar role={role} userName={userName} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <WorkspaceTabBar />

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <main className="min-w-0 flex-1 overflow-y-auto bg-background p-6">
              {children}
            </main>
            <ModulePanelRail />
          </div>
        </div>
      </div>

      <PopoutLayer />
    </div>
  );
}
