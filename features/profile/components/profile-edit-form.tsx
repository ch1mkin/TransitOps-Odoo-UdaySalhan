"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileName } from "@/lib/profile/actions";

interface ProfileEditFormProps {
  fullName: string;
  email: string;
}

export function ProfileEditForm({ fullName, email }: ProfileEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfileName({ full_name: name.trim() });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 workspace-shadow">
      <h2 className="text-sm font-semibold">Edit profile</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Update your display name used across the workspace.
      </p>
      <div className="mt-4 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="profile-full-name">Full name</Label>
          <Input
            id="profile-full-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={email} disabled />
        </div>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
