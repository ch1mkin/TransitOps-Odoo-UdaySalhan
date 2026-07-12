import { create } from "zustand";
import { isWorkspaceTabPath } from "@/constants/sections";
import { generateId } from "@/lib/utils";
import type { ModulePanel, PopoutWindow, WorkspaceTab } from "@/types";

interface WorkspaceState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  modules: ModulePanel[];
  popouts: PopoutWindow[];
  maxZIndex: number;

  setActiveTab: (tabId: string | null) => void;
  openTab: (tab: Omit<WorkspaceTab, "id" | "pinned"> & { id?: string }) => string;
  closeTab: (tabId: string) => void;
  reorderTabs: (activeId: string, overId: string) => void;
  popoutTab: (tabId: string) => void;
  dockPopout: (popoutId: string) => void;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;

  openModule: (
    module: Omit<ModulePanel, "id" | "collapsed"> & { id?: string }
  ) => string;
  closeModule: (moduleId: string) => void;
  toggleModuleCollapsed: (moduleId: string) => void;
  closeEphemeralModules: () => void;

  closePopout: (popoutId: string) => void;
  minimizePopout: (popoutId: string) => void;
  restorePopout: (popoutId: string) => void;
  updatePopoutPosition: (
    popoutId: string,
    position: { x: number; y: number }
  ) => void;
  bringPopoutToFront: (popoutId: string) => void;

  onNavigate: (href: string) => void;
  resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  sidebarCollapsed: false,
  sidebarOpen: true,
  modules: [],
  popouts: [],
  maxZIndex: 100,

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  openTab: (tabInput) => {
    if (tabInput.type === "route" || tabInput.type === "home") {
      return "";
    }

    const existing = get().tabs.find(
      (t) =>
        t.href === tabInput.href ||
        (tabInput.entityId &&
          t.entityId === tabInput.entityId &&
          t.entityType === tabInput.entityType)
    );

    if (existing) {
      set({ activeTabId: existing.id });
      return existing.id;
    }

    const id = tabInput.id ?? generateId();
    const newTab: WorkspaceTab = {
      ...tabInput,
      id,
      pinned: false,
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));

    return id;
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId, popouts } = get();
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const newTabs = tabs.filter((t) => t.id !== tabId);
    const newPopouts = popouts.filter((p) => p.tabId !== tabId);

    let newActiveId = activeTabId;
    if (activeTabId === tabId) {
      const closedIndex = tabs.findIndex((t) => t.id === tabId);
      newActiveId = newTabs[Math.max(0, closedIndex - 1)]?.id ?? null;
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveId,
      popouts: newPopouts,
    });
  },

  reorderTabs: (activeId, overId) => {
    const { tabs } = get();
    const activeIndex = tabs.findIndex((t) => t.id === activeId);
    const overIndex = tabs.findIndex((t) => t.id === overId);

    if (activeIndex < 0 || overIndex < 0) return;

    const newTabs = [...tabs];
    const [removed] = newTabs.splice(activeIndex, 1);
    newTabs.splice(overIndex, 0, removed);
    set({ tabs: newTabs });
  },

  popoutTab: (tabId) => {
    const { tabs, popouts, maxZIndex } = get();
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const existing = popouts.find((p) => p.tabId === tabId);
    if (existing) {
      get().bringPopoutToFront(existing.id);
      return;
    }

    const offset = popouts.length * 24;
    const popout: PopoutWindow = {
      id: generateId(),
      tabId: tab.id,
      title: tab.title,
      contentKey: tab.href,
      x: 120 + offset,
      y: 80 + offset,
      width: 520,
      height: 420,
      minimized: false,
      zIndex: maxZIndex + 1,
    };

    set({
      popouts: [...popouts, popout],
      maxZIndex: maxZIndex + 1,
    });
  },

  dockPopout: (popoutId) => {
    const { popouts } = get();
    const popout = popouts.find((p) => p.id === popoutId);
    if (!popout) return;

    set({
      popouts: popouts.filter((p) => p.id !== popoutId),
      activeTabId: popout.tabId,
    });
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModule: (moduleInput) => {
    const existing = get().modules.find(
      (m) => m.type === moduleInput.type && m.contentKey === moduleInput.contentKey
    );

    if (existing) {
      set((state) => ({
        modules: state.modules.map((m) =>
          m.id === existing.id ? { ...m, collapsed: false } : m
        ),
      }));
      return existing.id;
    }

    const id = moduleInput.id ?? generateId();
    const newModule: ModulePanel = {
      ...moduleInput,
      id,
      collapsed: false,
    };

    set((state) => ({
      modules: [...state.modules, newModule],
    }));

    return id;
  },

  closeModule: (moduleId) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== moduleId),
    })),

  toggleModuleCollapsed: (moduleId) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === moduleId ? { ...m, collapsed: !m.collapsed } : m
      ),
    })),

  closeEphemeralModules: () =>
    set((state) => ({
      modules: state.modules.filter((m) => !m.ephemeral),
    })),

  closePopout: (popoutId) =>
    set((state) => ({
      popouts: state.popouts.filter((p) => p.id !== popoutId),
    })),

  minimizePopout: (popoutId) =>
    set((state) => ({
      popouts: state.popouts.map((p) =>
        p.id === popoutId ? { ...p, minimized: true } : p
      ),
    })),

  restorePopout: (popoutId) =>
    set((state) => ({
      popouts: state.popouts.map((p) =>
        p.id === popoutId ? { ...p, minimized: false } : p
      ),
    })),

  updatePopoutPosition: (popoutId, position) =>
    set((state) => ({
      popouts: state.popouts.map((p) =>
        p.id === popoutId ? { ...p, ...position } : p
      ),
    })),

  bringPopoutToFront: (popoutId) =>
    set((state) => ({
      maxZIndex: state.maxZIndex + 1,
      popouts: state.popouts.map((p) =>
        p.id === popoutId
          ? { ...p, zIndex: state.maxZIndex + 1, minimized: false }
          : p
      ),
    })),

  onNavigate: (href) => {
    const { tabs } = get();
    get().closeEphemeralModules();

    if (isWorkspaceTabPath(href)) {
      const matchingTab = tabs.find((t) => t.href === href);
      set({ activeTabId: matchingTab?.id ?? null });
      return;
    }

    set({ activeTabId: null });
  },

  resetWorkspace: () =>
    set({
      tabs: [],
      activeTabId: null,
      modules: [],
      popouts: [],
      maxZIndex: 100,
    }),
}));
