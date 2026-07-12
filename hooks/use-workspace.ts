"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace-store";
import { isWorkspaceTabPath } from "@/constants/sections";
import { fetchWorkspaceTabTitle } from "@/lib/fleet/client-queries";
import { getWorkspaceTabMeta } from "@/lib/workspace-tabs";

export function useWorkspaceNavigation() {
  const pathname = usePathname();
  const onNavigate = useWorkspaceStore((s) => s.onNavigate);

  useEffect(() => {
    onNavigate(pathname);
  }, [pathname, onNavigate]);
}

export function useEnsureWorkspaceTab(options?: {
  profileTitle?: string;
  profileUserId?: string;
}) {
  const pathname = usePathname();
  const openTab = useWorkspaceStore((s) => s.openTab);

  useEffect(() => {
    if (!isWorkspaceTabPath(pathname)) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const base = pathname.split("?")[0];
      let meta = getWorkspaceTabMeta(pathname, options);

      if (meta && base !== "/profile") {
        const title = await fetchWorkspaceTabTitle(base);
        meta = { ...meta, title: title ?? meta.title };
      }

      if (cancelled || !meta) {
        return;
      }

      openTab({
        title: meta.title,
        href: meta.href,
        type: meta.type,
        entityType: meta.entityType,
        entityId: meta.entityId,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, openTab, options?.profileTitle, options?.profileUserId]);
}

export function useOpenWorkspaceTab() {
  const openTab = useWorkspaceStore((s) => s.openTab);

  return (
    title: string,
    href: string,
    options?: {
      type?: "route" | "entity" | "module";
      entityType?: string;
      entityId?: string;
      icon?: string;
    }
  ) => {
    return openTab({
      title,
      href,
      type: options?.type ?? "route",
      entityType: options?.entityType,
      entityId: options?.entityId,
      icon: options?.icon,
    });
  };
}

export function useOpenModule() {
  const openModule = useWorkspaceStore((s) => s.openModule);

  return (
    title: string,
    type: "profile" | "filters" | "details" | "form",
    contentKey: string,
    options?: {
      ephemeral?: boolean;
      width?: number;
      metadata?: Record<string, unknown>;
    }
  ) => {
    return openModule({
      title,
      type,
      contentKey,
      ephemeral: options?.ephemeral ?? true,
      width: options?.width ?? 380,
      metadata: options?.metadata,
    });
  };
}
