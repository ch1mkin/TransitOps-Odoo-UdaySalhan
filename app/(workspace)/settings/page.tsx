import { SettingsModule } from "@/features/settings/components/settings-module";
import { getPageRole } from "@/lib/fleet/page-role";

export default async function SettingsPage() {
  const role = await getPageRole();
  return <SettingsModule role={role} />;
}
