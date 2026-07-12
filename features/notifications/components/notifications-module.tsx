"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { ModulePage } from "@/components/data/module-page";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/fleet/actions";
import { createClient } from "@/lib/supabase/client";
import { mapNotification } from "@/lib/fleet/mappers";
import { cn } from "@/lib/utils";

interface NotificationsModuleProps {
  userId: string;
}

async function fetchNotifications(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapNotification);
}

export function NotificationsModule({ userId }: NotificationsModuleProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId),
    refetchInterval: 30_000,
  });

  const unread = notifications.filter((item) => !item.read_at).length;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
  };

  const handleOpen = async (id: string, link?: string | null) => {
    await markNotificationRead(id);
    await invalidate();
    if (link) router.push(link);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await invalidate();
  };

  return (
    <ModulePage
      title="Notifications"
      description="Operational alerts, trip updates, and compliance reminders for your workspace."
      actions={
        unread > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={() => void handleMarkAll()}>
            Mark all read
          </Button>
        ) : null
      }
    >
      <div className="rounded-xl border border-border bg-card workspace-shadow">
        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading notifications…</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <Bell className="mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Trip lifecycle events, license alerts, and other operational updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "w-full px-4 py-4 text-left transition-colors hover:bg-muted/40",
                  !item.read_at && "bg-accent/5"
                )}
                onClick={() => void handleOpen(item.id, item.link)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!item.read_at ? (
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ModulePage>
  );
}
