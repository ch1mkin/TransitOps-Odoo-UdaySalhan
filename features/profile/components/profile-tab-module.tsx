"use client";

import { useEffect, useState } from "react";
import { ROLE_LABELS, ROLES, type Role } from "@/constants/roles";
import { EntityDetailModule } from "@/components/data/entity-detail-module";
import { TruckLoader } from "@/components/ui/truck-loader";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface ProfileTabModuleProps {
  compact?: boolean;
  profile?: Profile | null;
  userName?: string;
  role?: Role;
  userId?: string;
}

export function ProfileTabModule({
  compact = false,
  profile: profileProp,
  userName = "User",
  role = ROLES.FLEET_MANAGER,
  userId,
}: ProfileTabModuleProps) {
  const [profile, setProfile] = useState<Profile | null>(profileProp ?? null);
  const [loading, setLoading] = useState(!profileProp);

  useEffect(() => {
    if (profileProp) {
      setProfile(profileProp);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId ?? user.id)
        .single<Profile>();

      if (!cancelled) {
        setProfile(data);
        setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [profileProp, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <TruckLoader size="sm" label="Loading profile…" />
      </div>
    );
  }

  const displayName = profile?.full_name ?? userName;
  const displayRole = (profile?.role ?? role) as Role;
  const email = profile?.email ?? "—";

  return (
    <EntityDetailModule
      title={displayName}
      subtitle="User Profile"
      entityType="profile"
      entityId={profile?.id ?? userId ?? "profile"}
      href="/profile"
      compact={compact}
      fields={[
        { label: "Full Name", value: displayName },
        { label: "Email", value: email },
        { label: "Role", value: ROLE_LABELS[displayRole] },
        {
          label: "Workspace",
          value: "Pinned tab — survives section navigation",
        },
      ]}
    />
  );
}
