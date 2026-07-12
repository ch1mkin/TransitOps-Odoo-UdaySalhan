"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  canAccessPath,
  getDefaultRoute,
} from "@/lib/fleet/permissions";
import type { Role } from "@/constants/roles";

interface RouteGuardProps {
  role: Role;
  children: React.ReactNode;
}

export function RouteGuard({ role, children }: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!canAccessPath(role, pathname)) {
      router.replace(getDefaultRoute(role));
    }
  }, [role, pathname, router]);

  if (!canAccessPath(role, pathname)) {
    return null;
  }

  return children;
}
