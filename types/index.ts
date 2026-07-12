import type { Role } from "@/constants/roles";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export type WorkspaceTabType = "home" | "route" | "entity" | "module";

export interface WorkspaceTab {
  id: string;
  title: string;
  href: string;
  type: WorkspaceTabType;
  pinned: boolean;
  icon?: string;
  entityType?: string;
  entityId?: string;
}

export type ModulePanelType = "profile" | "filters" | "details" | "form";

export interface ModulePanel {
  id: string;
  title: string;
  type: ModulePanelType;
  ephemeral: boolean;
  collapsed: boolean;
  width: number;
  contentKey: string;
  metadata?: Record<string, unknown>;
}

export interface PopoutWindow {
  id: string;
  tabId: string;
  title: string;
  contentKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  zIndex: number;
}
