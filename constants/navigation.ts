import {
  BarChart3,
  Bell,
  Car,
  ClipboardList,
  FileText,
  Fuel,
  History,
  LayoutDashboard,
  LineChart,
  PlusCircle,
  Receipt,
  Route,
  Settings,
  ShieldAlert,
  UserCircle,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ROLES, type Role } from "./roles";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

const ALL_ROLES = Object.values(ROLES);

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ALL_ROLES,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ALL_ROLES,
  },
  // Fleet Manager
  {
    title: "Vehicle Registry",
    href: "/vehicles",
    icon: Car,
    roles: [ROLES.FLEET_MANAGER],
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    roles: [ROLES.FLEET_MANAGER],
  },
  {
    title: "Vehicle Documents",
    href: "/vehicle-documents",
    icon: FileText,
    roles: [ROLES.FLEET_MANAGER],
  },
  {
    title: "Fleet Analytics",
    href: "/reports",
    icon: BarChart3,
    roles: [ROLES.FLEET_MANAGER],
  },
  // Dispatcher
  {
    title: "Create Trip",
    href: "/trips",
    icon: PlusCircle,
    roles: [ROLES.DISPATCHER],
  },
  {
    title: "Active Trips",
    href: "/trips/active",
    icon: Route,
    roles: [ROLES.DISPATCHER],
  },
  {
    title: "Trip History",
    href: "/trips/history",
    icon: History,
    roles: [ROLES.DISPATCHER],
  },
  // Safety Officer
  {
    title: "Driver Management",
    href: "/drivers",
    icon: Users,
    roles: [ROLES.SAFETY_OFFICER],
  },
  {
    title: "License Monitoring",
    href: "/license-monitoring",
    icon: ClipboardList,
    roles: [ROLES.SAFETY_OFFICER],
  },
  {
    title: "Safety Reports",
    href: "/reports",
    icon: ShieldAlert,
    roles: [ROLES.SAFETY_OFFICER],
  },
  // Financial Analyst
  {
    title: "Fuel Logs",
    href: "/fuel",
    icon: Fuel,
    roles: [ROLES.FINANCIAL_ANALYST],
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    roles: [ROLES.FINANCIAL_ANALYST],
  },
  {
    title: "Financial Reports",
    href: "/reports",
    icon: BarChart3,
    roles: [ROLES.FINANCIAL_ANALYST],
  },
  {
    title: "ROI Analytics",
    href: "/reports/roi",
    icon: LineChart,
    roles: [ROLES.FINANCIAL_ANALYST],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ALL_ROLES,
  },
];

export const PROFILE_NAV: NavItem = {
  title: "Profile",
  href: "/profile",
  icon: UserCircle,
  roles: ALL_ROLES,
};

export function getNavForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

const MOBILE_PRIMARY_HREFS: Record<Role, string[]> = {
  [ROLES.FLEET_MANAGER]: ["/vehicles", "/reports"],
  [ROLES.DISPATCHER]: ["/trips/active", "/trips"],
  [ROLES.SAFETY_OFFICER]: ["/drivers", "/license-monitoring"],
  [ROLES.FINANCIAL_ANALYST]: ["/fuel", "/expenses"],
};

/** Primary destinations pinned to the mobile bottom bar (excluding the menu button). */
export function getMobileBottomNavItems(role: Role): NavItem[] {
  const all = getNavForRole(role);
  const find = (href: string) => all.find((item) => item.href === href);

  const dashboard = find("/dashboard");
  const notifications = find("/notifications");
  const primaries = MOBILE_PRIMARY_HREFS[role]
    .map((href) => find(href))
    .filter((item): item is NavItem => Boolean(item));

  return [dashboard, ...primaries, notifications].filter(
    (item): item is NavItem => Boolean(item)
  );
}

/** Remaining navigation items shown inside the mobile menu drawer. */
export function getMobileMenuNavItems(role: Role): NavItem[] {
  const pinned = new Set(getMobileBottomNavItems(role).map((item) => item.href));
  return getNavForRole(role).filter((item) => !pinned.has(item.href));
}

export function getNavTitleForPath(pathname: string, role: Role): string {
  const items = getNavForRole(role);
  const active = getActiveNavHref(pathname, items);
  return items.find((item) => item.href === active)?.title ?? "TransitOps";
}

/** Picks the single best-matching nav href (longest prefix match) for the current path. */
export function getActiveNavHref(pathname: string, navItems: NavItem[]): string | null {
  let best: NavItem | null = null;

  for (const item of navItems) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (!matches) continue;
    if (!best || item.href.length > best.href.length) {
      best = item;
    }
  }

  return best?.href ?? null;
}
