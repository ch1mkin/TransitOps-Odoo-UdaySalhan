"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/fleet/actions";
import { createClient } from "@/lib/supabase/client";
import { mapNotification } from "@/lib/fleet/mappers";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  userId: string;
  variant?: "workspace" | "mobile-header";
}

async function fetchNotifications(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapNotification);
}

export function NotificationBell({
  userId,
  variant = "workspace",
}: NotificationBellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const isMobileHeader = variant === "mobile-header";

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => fetchNotifications(userId),
    refetchInterval: 60_000,
  });

  const unread = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    if (!open || !isMobileHeader) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isMobileHeader]);

  const handleOpen = async (id: string, link?: string | null) => {
    await markNotificationRead(id);
    await queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    setOpen(false);
    if (link) router.push(link);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    await queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
  };

  const panel = (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xl",
        isMobileHeader
          ? "fixed inset-x-3 top-16 z-[90] max-h-[min(70dvh,32rem)]"
          : "absolute right-0 top-full z-50 mt-2 w-80"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Notifications</p>
        <div className="flex items-center gap-3">
          {unread > 0 ? (
            <button
              type="button"
              className="text-xs text-accent hover:underline"
              onClick={() => void handleMarkAll()}
            >
              Mark all read
            </button>
          ) : null}
          {isMobileHeader ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
      <div className="max-h-[min(60dvh,20rem)] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </p>
        ) : (
          notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/50",
                !item.read_at && "bg-accent/5"
              )}
              onClick={() => void handleOpen(item.id, item.link)}
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      className={cn("relative", !isMobileHeader && "ml-auto")}
      data-walkthrough="notifications"
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative text-slate-300 hover:bg-slate-700/50 hover:text-white",
          isMobileHeader ? "size-9" : "size-7"
        )}
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className={isMobileHeader ? "size-4" : "size-3.5"} />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          {isMobileHeader ? (
            <button
              type="button"
              className="fixed inset-0 z-[85] bg-black/40"
              aria-label="Close notifications"
              onClick={() => setOpen(false)}
            />
          ) : null}
          {panel}
        </>
      ) : null}
    </div>
  );
}
