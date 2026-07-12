/** Sidebar sections — navigation only, never workspace tabs */
export const SECTION_PATHS = [
  "/dashboard",
  "/vehicles",
  "/vehicle-documents",
  "/drivers",
  "/license-monitoring",
  "/trips",
  "/trips/active",
  "/trips/history",
  "/maintenance",
  "/fuel",
  "/expenses",
  "/reports",
  "/reports/roi",
  "/settings",
] as const;

const ENTITY_PATH_RE = /^\/(vehicles|drivers|trips)\/[^/]+$/;
const PROFILE_PATH_RE = /^\/profile$/;

export function isSectionPath(pathname: string): boolean {
  const base = pathname.split("?")[0];
  return SECTION_PATHS.includes(base as (typeof SECTION_PATHS)[number]);
}

export function isWorkspaceTabPath(pathname: string): boolean {
  const base = pathname.split("?")[0];
  return ENTITY_PATH_RE.test(base) || PROFILE_PATH_RE.test(base);
}

export function getEntityTypeFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/(vehicles|drivers|trips)\//);
  return match?.[1];
}
