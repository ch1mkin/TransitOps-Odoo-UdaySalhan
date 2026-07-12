"use client";

import { useRouter } from "next/navigation";
import { useOpenWorkspaceTab } from "@/hooks/use-workspace";
import { useWorkspaceStore } from "@/store/workspace-store";

export function useEntityTab() {
  const router = useRouter();
  const openTab = useOpenWorkspaceTab();

  const openEntity = (
    title: string,
    href: string,
    entityType: string,
    entityId: string
  ) => {
    openTab(title, href, {
      type: "entity",
      entityType,
      entityId,
    });
    router.push(href);
  };

  const popoutEntity = (
    title: string,
    href: string,
    entityType: string,
    entityId: string,
    options?: { navigate?: boolean }
  ) => {
    const tabId = openTab(title, href, {
      type: "entity",
      entityType,
      entityId,
    });

    if (tabId) {
      useWorkspaceStore.getState().popoutTab(tabId);
    }

    if (options?.navigate) {
      router.push(href);
    }

    return tabId;
  };

  return { openEntity, popoutEntity };
}

export function useProfileTab() {
  const router = useRouter();
  const openTab = useOpenWorkspaceTab();

  return (title: string, userId: string) => {
    openTab(title, "/profile", {
      type: "module",
      entityType: "profile",
      entityId: userId,
    });
    router.push("/profile");
  };
}
