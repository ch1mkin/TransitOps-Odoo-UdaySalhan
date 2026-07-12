"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDriverRegistrationInvite } from "@/lib/fleet/driver-registration-actions";

interface DriverInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriverInviteDialog({ open, onOpenChange }: DriverInviteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateInvite = async () => {
    setLoading(true);
    const result = await createDriverRegistrationInvite();
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setInviteUrl(result.url ?? null);
    toast.success("Driver registration link created.");
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setInviteUrl(null);
      setCopied(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title="Invite driver"
      description="Share a secure link so the driver can submit their own profile and identity documents."
      className="w-[min(100%,32rem)]"
    >
      <div className="space-y-4">
        {!inviteUrl ? (
          <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground">
            The link stays valid for 7 days. After the driver submits their information, you can
            review and approve it from the driver profile.
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="driver-invite-url">Registration link</Label>
            <div className="flex gap-2">
              <Input id="driver-invite-url" readOnly value={inviteUrl} />
              <Button type="button" variant="outline" onClick={() => void handleCopy()}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Close
          </Button>
          {!inviteUrl ? (
            <Button type="button" onClick={() => void handleCreateInvite()} disabled={loading}>
              <Link2 className="size-4" />
              {loading ? "Creating…" : "Generate link"}
            </Button>
          ) : (
            <Button type="button" onClick={() => void handleCopy()}>
              {copied ? "Copied" : "Copy link"}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
