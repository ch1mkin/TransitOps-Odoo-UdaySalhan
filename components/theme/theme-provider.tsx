"use client";

import { useEffect } from "react";
import { resolveTheme, useThemeStore, type ThemeMode } from "@/store/theme-store";

function readPersistedMode(): ThemeMode {
  if (typeof window === "undefined") return "light";

  try {
    const raw = localStorage.getItem("transitops-theme");
    if (!raw) return "light";
    const parsed = JSON.parse(raw) as { state?: { mode?: ThemeMode } };
    return parsed.state?.mode ?? "light";
  } catch {
    return "light";
  }
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(useThemeStore.persist.hasHydrated() ? mode : readPersistedMode());

    const onHydrate = () => applyTheme(useThemeStore.getState().mode);
    const unsubHydrate = useThemeStore.persist.onFinishHydration(onHydrate);

    return unsubHydrate;
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  return children;
}
