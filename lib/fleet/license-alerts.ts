"use server";

import { revalidatePath } from "next/cache";
import { ROLES } from "@/constants/roles";
import { requireSessionRole } from "@/lib/fleet/session";
import { notifyUser } from "@/lib/fleet/trip-events";
import { isLicenseExpired } from "@/lib/fleet/trip-lifecycle";
import { DEFAULT_ROLE_SETTINGS } from "@/store/settings-store";
import { sendTransactionalEmail } from "@/lib/utils/email";
import { createClient } from "@/lib/supabase/server";
import type { Driver } from "@/types/entities";

function daysUntil(expiry: string) {
  const diff = new Date(expiry).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function hasRecentLicenseAlert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  driverId: string
) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("link", `/drivers/${driverId}`)
    .gte("created_at", since)
    .ilike("title", "License%")
    .limit(1);

  return (data?.length ?? 0) > 0;
}

function alertCopy(driver: Driver) {
  if (isLicenseExpired(driver.license_expiry)) {
    return {
      title: "License expired",
      message: `${driver.name}'s driving license expired on ${driver.license_expiry}.`,
      emailSubject: `TransitOps: ${driver.name}'s license has expired`,
    };
  }

  const days = daysUntil(driver.license_expiry);
  return {
    title: "License expiring soon",
    message: `${driver.name}'s license expires in ${days} day${days === 1 ? "" : "s"} (${driver.license_expiry}).`,
    emailSubject: `TransitOps: ${driver.name}'s license expires in ${days} days`,
  };
}

export async function syncLicenseExpiryNotifications(options?: {
  warningDays?: number;
  sendEmailReminders?: boolean;
}): Promise<{
  success: boolean;
  created: number;
  emailed: number;
  error?: string;
}> {
  const auth = await requireSessionRole([ROLES.SAFETY_OFFICER, ROLES.FLEET_MANAGER]);
  if (!auth.ok) {
    return { success: false, created: 0, emailed: 0, error: auth.error };
  }

  const supabase = await createClient();
  const warningDays =
    options?.warningDays ?? DEFAULT_ROLE_SETTINGS[ROLES.SAFETY_OFFICER].licenseExpiryWarningDays;
  const emailReminders =
    options?.sendEmailReminders ??
    DEFAULT_ROLE_SETTINGS[ROLES.SAFETY_OFFICER].sendLicenseEmailReminders;

  const { data: drivers, error: driversError } = await supabase
    .from("drivers")
    .select("id, name, email, license_expiry")
    .order("license_expiry");

  if (driversError) {
    return { success: false, created: 0, emailed: 0, error: driversError.message };
  }

  const { data: recipients } = await supabase
    .from("profiles")
    .select("id, email")
    .in("role", Object.values(ROLES));

  const alertDrivers = (drivers ?? []).filter((driver) => {
    if (isLicenseExpired(driver.license_expiry)) return true;
    return daysUntil(driver.license_expiry) <= warningDays;
  }) as Driver[];

  let created = 0;
  let emailed = 0;

  for (const driver of alertDrivers) {
    const copy = alertCopy(driver);

    for (const recipient of recipients ?? []) {
      const alreadyNotified = await hasRecentLicenseAlert(supabase, recipient.id, driver.id);
      if (alreadyNotified) continue;

      await notifyUser(supabase, {
        userId: recipient.id,
        title: copy.title,
        message: copy.message,
        link: `/drivers/${driver.id}`,
      });
      created += 1;
    }

    if (emailReminders && driver.email) {
      const email = await sendTransactionalEmail({
        to: driver.email,
        subject: copy.emailSubject,
        html: `<p>${copy.message}</p><p>Please renew the license and update records in TransitOps.</p>`,
      });
      if (email.sent) emailed += 1;
    }
  }

  revalidatePath("/license-monitoring");
  revalidatePath("/dashboard");

  return { success: true, created, emailed };
}
