import type { SupabaseClient } from "@supabase/supabase-js";
import { ROLES, type Role } from "@/constants/roles";

type TripEventType = "created" | "dispatched" | "completed" | "cancelled";

const ALL_ROLES = Object.values(ROLES);

export async function recordTripUpdate(
  supabase: SupabaseClient,
  input: {
    tripId: string;
    actorId: string;
    eventType: TripEventType;
    message: string;
  }
) {
  await supabase.from("trip_updates").insert({
    trip_id: input.tripId,
    actor_id: input.actorId,
    event_type: input.eventType,
    message: input.message,
  });
}

export async function notifyByRoles(
  supabase: SupabaseClient,
  input: {
    roles: Role[];
    title: string;
    message: string;
    link?: string;
    excludeUserId?: string;
  }
) {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .in("role", input.roles);

  const recipients = (profiles ?? [])
    .map((profile) => profile.id)
    .filter((id) => id !== input.excludeUserId);

  if (recipients.length === 0) return;

  await supabase.from("notifications").insert(
    recipients.map((userId) => ({
      user_id: userId,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    }))
  );
}

export async function notifyAllRoles(
  supabase: SupabaseClient,
  input: {
    title: string;
    message: string;
    link?: string;
    excludeUserId?: string;
  }
) {
  return notifyByRoles(supabase, {
    ...input,
    roles: ALL_ROLES,
  });
}

export async function notifyTripStakeholders(
  supabase: SupabaseClient,
  input: {
    tripNumber: string;
    tripId: string;
    title: string;
    message: string;
    excludeUserId?: string;
  }
) {
  await notifyAllRoles(supabase, {
    title: input.title,
    message: input.message,
    link: `/trips/${input.tripId}`,
    excludeUserId: input.excludeUserId,
  });
}

export async function notifyUser(
  supabase: SupabaseClient,
  input: {
    userId: string;
    title: string;
    message: string;
    link?: string;
  }
) {
  await supabase.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    message: input.message,
    link: input.link ?? null,
  });
}
