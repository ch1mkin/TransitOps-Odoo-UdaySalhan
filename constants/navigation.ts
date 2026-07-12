import {
  BarChart3,
  Car,
  Fuel,
  LayoutDashboard,
  Receipt,
  Route,
  Settings,
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
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      ROLES.FLEET_MANAGER,
      ROLES.DISPATCHER,
      ROLES.SAFETY_OFFICER,
      ROLES.FINANCIAL_ANALYST,
    ],
  },
  {
    title: "Fleet",
    href: "/vehicles",
    icon: Car,
    roles: [
      ROLES.FLEET_MANAGER,
      ROLES.DISPATCHER,
      ROLES.SAFETY_OFFICER,
      ROLES.FINANCIAL_ANALYST,
    ],
    children: [
      {
        title: "Vehicles",
        href: "/vehicles",
        icon: Car,
        roles: [
          ROLES.FLEET_MANAGER,
          ROLES.DISPATCHER,
          ROLES.SAFETY_OFFICER,
          ROLES.FINANCIAL_ANALYST,
        ],
      },
    ],
  },
  {
    title: "Drivers",
    href: "/drivers",
    icon: Users,
    roles: [
      ROLES.FLEET_MANAGER,
      ROLES.DISPATCHER,
      ROLES.SAFETY_OFFICER,
      ROLES.FINANCIAL_ANALYST,
    ],
  },
  {
    title: "Trips",
    href: "/trips",
    icon: Route,
    roles: [ROLES.FLEET_MANAGER, ROLES.DISPATCHER, ROLES.SAFETY_OFFICER],
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    roles: [ROLES.FLEET_MANAGER],
  },
  {
    title: "Fuel Logs",
    href: "/fuel",
    icon: Fuel,
    roles: [ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    roles: [ROLES.FLEET_MANAGER, ROLES.FINANCIAL_ANALYST],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: [
      ROLES.FLEET_MANAGER,
      ROLES.FINANCIAL_ANALYST,
      ROLES.SAFETY_OFFICER,
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: [
      ROLES.FLEET_MANAGER,
      ROLES.DISPATCHER,
      ROLES.SAFETY_OFFICER,
      ROLES.FINANCIAL_ANALYST,
    ],
  },
];

export const PROFILE_NAV: NavItem = {
  title: "Profile",
  href: "/profile",
  icon: UserCircle,
  roles: [
    ROLES.FLEET_MANAGER,
    ROLES.DISPATCHER,
    ROLES.SAFETY_OFFICER,
    ROLES.FINANCIAL_ANALYST,
  ],
};

export function getNavForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
