"use client";

import { useEffect, useRef } from "react";
import { ROLES, type Role } from "@/constants/roles";
import { syncLicenseExpiryNotifications } from "@/lib/fleet/license-alerts";
import { useSettingsStore } from "@/store/settings-store";

interface LicenseAlertSyncProps {
  role: Role;
}

export function LicenseAlertSync({ role }: LicenseAlertSyncProps) {
  const synced = useRef(false);
  const safetySettings = useSettingsStore((s) => s.byRole[ROLES.SAFETY_OFFICER]);

  useEffect(() => {
    if (synced.current) return;
    if (role !== ROLES.SAFETY_OFFICER && role !== ROLES.FLEET_MANAGER) return;

    synced.current = true;
    void syncLicenseExpiryNotifications({
      warningDays: safetySettings.licenseExpiryWarningDays,
      sendEmailReminders: safetySettings.sendLicenseEmailReminders,
    });
  }, [role, safetySettings.licenseExpiryWarningDays, safetySettings.sendLicenseEmailReminders]);

  return null;
}
