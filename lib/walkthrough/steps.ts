import { getNavForRole } from "@/constants/navigation";
import { ROLE_LABELS, type Role } from "@/constants/roles";
import { NAV_WALKTHROUGH_COPY } from "@/constants/walkthrough";

export type WalkthroughPlacement = "top" | "right" | "bottom" | "left";

export interface WalkthroughStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement: WalkthroughPlacement;
}

export function buildWalkthroughSteps(role: Role): WalkthroughStep[] {
  const navItems = getNavForRole(role);
  const roleLabel = ROLE_LABELS[role];

  const steps: WalkthroughStep[] = [
    {
      id: "welcome",
      target: '[data-walkthrough="workspace-header"]',
      title: `Welcome, ${roleLabel}`,
      description:
        "This short tour shows where modules, tabs, and alerts live in your Linked Workspace. You can skip anytime.",
      placement: "bottom",
    },
    {
      id: "sidebar",
      target: '[data-walkthrough="sidebar"]',
      title: "Navigation sidebar",
      description:
        "Your sidebar only shows sections permitted for your role. Click any item to open that module.",
      placement: "right",
    },
    ...navItems.map((item) => ({
      id: `nav-${item.href}`,
      target: `[data-walkthrough-nav="${item.href}"]`,
      title: item.title,
      description:
        NAV_WALKTHROUGH_COPY[item.href] ??
        `Open ${item.title} to work with this part of the platform.`,
      placement: "right" as WalkthroughPlacement,
    })),
    {
      id: "tab-bar",
      target: '[data-walkthrough="tab-bar"]',
      title: "Workspace tabs",
      description:
        "Records you open appear as tabs here. Drag to reorder, click X to close, and double-click to pop out into a floating window.",
      placement: "bottom",
    },
    {
      id: "notifications",
      target: '[data-walkthrough="notifications"]',
      title: "Notifications",
      description:
        "Trip lifecycle events and operational alerts land here. Click an item to jump to the related record.",
      placement: "bottom",
    },
    {
      id: "profile",
      target: '[data-walkthrough="profile"]',
      title: "Profile & sign out",
      description:
        "Open your profile in a workspace tab. Sign out returns you to the login screen.",
      placement: "right",
    },
    {
      id: "main-content",
      target: '[data-walkthrough="main-content"]',
      title: "Module workspace",
      description:
        "List pages, dashboards, and detail views render here. Use search, date filters, sorting, and export on data tables.",
      placement: "left",
    },
  ];

  return steps;
}

export function walkthroughKey(userId: string, role: Role): string {
  return `${userId}:${role}`;
}
