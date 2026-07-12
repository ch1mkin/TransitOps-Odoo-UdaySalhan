import type { Role } from "@/constants/roles";
import { ROLES } from "@/constants/roles";

/** Demo accounts for testing each workspace role in Settings */
export const MOCK_DEMO_ACCOUNTS: {
  serial: number;
  role: Role;
  full_name: string;
  email: string;
  password_hint: string;
}[] = [
  {
    serial: 1,
    role: ROLES.FLEET_MANAGER,
    full_name: "Uday Salhan",
    email: "fleet.manager@transitops.demo",
    password_hint: "TransitOps1!",
  },
  {
    serial: 2,
    role: ROLES.DISPATCHER,
    full_name: "Priya Sharma",
    email: "dispatcher@transitops.demo",
    password_hint: "TransitOps1!",
  },
  {
    serial: 3,
    role: ROLES.SAFETY_OFFICER,
    full_name: "Arjun Mehta",
    email: "safety@transitops.demo",
    password_hint: "TransitOps1!",
  },
  {
    serial: 4,
    role: ROLES.FINANCIAL_ANALYST,
    full_name: "Neha Gupta",
    email: "finance@transitops.demo",
    password_hint: "TransitOps1!",
  },
];
