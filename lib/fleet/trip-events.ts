import type { SupabaseClient } from "@supabase/supabase-js";
import { ROLES } from "@/constants/roles";

type TripEventType = "created" | "dispatched" | "completed" | "cancelled";

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
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .in("role", [ROLES.DISPATCHER, ROLES.FLEET_MANAGER]);

  const recipients = (profiles ?? [])
    .map((p) => p.id)
    .filter((id) => id !== input.excludeUserId);

  if (recipients.length === 0) return;

  await supabase.from("notifications").insert(
    recipients.map((userId) => ({
      user_id: userId,
      title: input.title,
      message: input.message,
      link: `/trips/${input.tripId}`,
    }))
  );
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
