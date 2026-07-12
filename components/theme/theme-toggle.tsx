"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveTheme, useThemeStore } from "@/store/theme-store";

interface ThemeToggleProps {
  variant?: "default" | "workspace";
  className?: string;
}

export function ThemeToggle({ variant = "default", className }: ThemeToggleProps) {
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [isDark, setIsDark] = useState(false);
  const isWorkspace = variant === "workspace";

  useEffect(() => {
    setIsDark(resolveTheme(mode) === "dark");
  }, [mode]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        isWorkspace
          ? "h-7 w-7 p-0 text-slate-300 hover:bg-slate-700/50 hover:text-white"
          : "h-9 w-9 p-0",
        className
      )}
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </Button>
  );
}
