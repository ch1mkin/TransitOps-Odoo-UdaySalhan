/**
 * Brand assets live in `public/brand/`.
 * Replace the files below (keep the same filenames) to update the logo everywhere.
 *
 * Recommended files:
 * - logo-icon.svg | logo-icon.png  — sidebar, auth, compact UI (square, ~32–64px)
 * - logo.svg | logo.png             — full horizontal logo (welcome, marketing)
 * - favicon.ico | favicon.svg       — browser tab icon
 * - apple-touch-icon.png            — iOS home screen (180×180)
 * - og-image.png                    — social / link previews (1200×630, optional)
 */
export const BRAND = {
  name: "TransitOps",
  logoIcon: "/brand/logo-icon.svg",
  logo: "/brand/logo.svg",
  favicon: "/brand/favicon.svg",
  appleTouchIcon: "/brand/apple-touch-icon.png",
  ogImage: "/brand/og-image.png",
} as const;
