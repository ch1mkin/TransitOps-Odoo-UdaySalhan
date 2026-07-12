"use client";

import { useEffect, useState } from "react";
import {
  DARK_CHART_THEME,
  LIGHT_CHART_THEME,
  type ChartTheme,
} from "@/components/charts/chart-theme";
import { resolveTheme, useThemeStore } from "@/store/theme-store";

export function useChartTheme(): ChartTheme {
  const mode = useThemeStore((state) => state.mode);
  const [theme, setTheme] = useState<ChartTheme>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? DARK_CHART_THEME
      : LIGHT_CHART_THEME
  );

  useEffect(() => {
    const apply = () => {
      setTheme(resolveTheme(mode) === "dark" ? DARK_CHART_THEME : LIGHT_CHART_THEME);
    };

    apply();

    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode]);

  return theme;
}
