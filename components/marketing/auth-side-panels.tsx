import { Shield } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ABOUT } from "@/constants/about";
import { cn } from "@/lib/utils";

interface AuthMarketingPanelProps {
  mode: "login" | "register";
  className?: string;
}

const HIGHLIGHTS = [
  "Vehicles, drivers, and trips in one workspace",
  "Dispatch rules for capacity, status, and licenses",
  "Documents, fuel logs, and compliance alerts",
];

export function AuthMarketingPanel({ mode, className }: AuthMarketingPanelProps) {
  return (
    <aside
      className={cn(
        "auth-marketing-panel hidden flex-col justify-center rounded-2xl border border-border/70 bg-card/55 p-6 backdrop-blur-md lg:flex",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <BrandLogo variant="icon" size={40} className="rounded-xl" />
        <div>
          <p className="text-sm font-semibold">{ABOUT.product}</p>
          <p className="text-xs text-muted-foreground">{ABOUT.event}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        {ABOUT.solution.summary}
      </p>

      <ul className="mt-5 space-y-2.5">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="border-l-2 border-accent/40 pl-3 text-sm leading-relaxed text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Shield className="mt-0.5 size-3.5 shrink-0 text-accent" />
        <span>
          {mode === "register"
            ? "Email verification is required before your first sign-in."
            : "Sign in with email OTP. Your role controls which modules you see."}
        </span>
      </div>
    </aside>
  );
}

export function AuthMarketingMobile({ mode }: AuthMarketingPanelProps) {
  return (
    <div className="mb-5 rounded-xl border border-border/70 bg-card/55 p-4 backdrop-blur-md lg:hidden">
      <p className="text-sm font-medium">{ABOUT.product}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {mode === "register"
          ? "Fleet operations workspace with role-based access and email verification."
          : "Sign in to manage vehicles, drivers, trips, and compliance in one place."}
      </p>
    </div>
  );
}
