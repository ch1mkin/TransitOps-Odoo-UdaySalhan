import { SettingsModule } from "@/features/settings/components/settings-module";
import { getPageRole } from "@/lib/fleet/page-role";
import { getSessionProfile } from "@/lib/fleet/session";

export default async function SettingsPage() {
  const [role, session] = await Promise.all([getPageRole(), getSessionProfile()]);
  return (
    <SettingsModule
      role={role}
      userId={session.user?.id ?? ""}
    />
  );
}
