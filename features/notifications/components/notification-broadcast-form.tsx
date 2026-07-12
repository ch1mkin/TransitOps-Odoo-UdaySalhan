"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, ROLES, type Role } from "@/constants/roles";
import { sendBroadcastNotification } from "@/lib/fleet/actions";
import { cn } from "@/lib/utils";

const ALL_ROLES: Role[] = [
  ROLES.FLEET_MANAGER,
  ROLES.DISPATCHER,
  ROLES.SAFETY_OFFICER,
  ROLES.FINANCIAL_ANALYST,
];

interface NotificationBroadcastFormProps {
  onSent?: () => void;
}

export function NotificationBroadcastForm({ onSent }: NotificationBroadcastFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [roles, setRoles] = useState<Role[]>(ALL_ROLES);
  const [sending, setSending] = useState(false);

  const allSelected = roles.length === ALL_ROLES.length;

  const toggleRole = (role: Role) => {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    );
  };

  const handleSelectAll = () => {
    setRoles(allSelected ? [] : ALL_ROLES);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    const result = await sendBroadcastNotification({
      title,
      message,
      link: link || undefined,
      roles,
    });
    setSending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      allSelected
        ? "Notification sent to all workspace roles."
        : `Notification sent to ${roles.length} role group(s).`
    );
    setTitle("");
    setMessage("");
    setLink("");
    setRoles(ALL_ROLES);
    onSent?.();
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="rounded-xl border border-border bg-card p-5 workspace-shadow"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Send notification</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Broadcast an in-app alert to users in selected workspace roles.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="broadcast-title">Title</Label>
          <Input
            id="broadcast-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Maintenance window tonight"
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="broadcast-message">Message</Label>
          <textarea
            id="broadcast-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe the update or action needed."
            maxLength={500}
            rows={3}
            required
            className="flex min-h-[5.5rem] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="broadcast-link">Link (optional)</Label>
          <Input
            id="broadcast-link"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="/dashboard"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label>Recipients</Label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-medium text-accent hover:underline"
            >
              {allSelected ? "Clear all" : "Select all roles"}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_ROLES.map((role) => {
              const selected = roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    selected
                      ? "border-accent/40 bg-accent/10 text-foreground"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              );
            })}
          </div>
        </div>

        <Button type="submit" disabled={sending || roles.length === 0} className="w-full sm:w-auto">
          <Send className="size-4" />
          {sending ? "Sending…" : "Send notification"}
        </Button>
      </div>
    </form>
  );
}
