import { NotificationsModule } from "@/features/notifications/components/notifications-module";
import { getSessionProfile } from "@/lib/fleet/session";

export default async function NotificationsPage() {
  const session = await getSessionProfile();

  return <NotificationsModule userId={session.user?.id ?? ""} />;
}
