import { isWorkspaceTabPath } from "@/constants/sections";

const ENTITY_TYPE_MAP: Record<string, string> = {
  vehicles: "vehicle",
  drivers: "driver",
  trips: "trip",
};

export function getWorkspaceTabMeta(
  href: string,
  options?: { profileTitle?: string; profileUserId?: string }
) {
  const base = href.split("?")[0];

  if (!isWorkspaceTabPath(base)) {
    return null;
  }

  if (base === "/profile") {
    return {
      title: options?.profileTitle ?? "Profile",
      href: base,
      entityType: "profile",
      entityId: options?.profileUserId ?? "profile",
      type: "module" as const,
    };
  }

  const match = base.match(/^\/(vehicles|drivers|trips)\/([^/]+)$/);
  if (!match) {
    return null;
  }

  const [, segment, entityId] = match;

  return {
    title: entityId.slice(0, 8),
    href: base,
    entityType: ENTITY_TYPE_MAP[segment],
    entityId,
    type: "entity" as const,
  };
}
