import { CheckCircle2, Shield } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MARKETING } from "@/constants/marketing";
import { cn } from "@/lib/utils";

interface AuthSidePanelsProps {
  mode: "login" | "register";
  className?: string;
}

export function AuthMarketingLeft({ mode, className }: AuthSidePanelsProps) {
  return (
    <aside
      className={cn(
        "auth-marketing-panel hidden flex-col justify-between rounded-2xl border border-border/70 bg-card/55 p-6 backdrop-blur-md lg:flex",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" size={40} className="rounded-xl" />
          <div>
            <p className="text-sm font-semibold">TransitOps</p>
            <p className="text-xs text-muted-foreground">{MARKETING.tagline}</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{MARKETING.intro}</p>

        <div className="mt-6 space-y-3">
          {MARKETING.workflow.map((item) => (
            <div key={item.step} className="flex gap-3">
              <span className="mt-0.5 font-mono text-xs font-semibold text-accent">{item.step}</span>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {mode === "login"
          ? "Use the workspace you were assigned after account setup."
          : "Pick the role that matches your day-to-day responsibilities."}
      </p>
    </aside>
  );
}

export function AuthMarketingRight({ mode, className }: AuthSidePanelsProps) {
  return (
    <aside
      className={cn(
        "auth-marketing-panel hidden flex-col justify-between rounded-2xl border border-border/70 bg-card/55 p-6 backdrop-blur-md lg:flex",
        className
      )}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          What you can manage
        </p>
        <ul className="mt-4 space-y-3">
          {MARKETING.modules.map((module) => (
            <li
              key={module.name}
              className="border-l-2 border-accent/40 pl-3"
            >
              <p className="text-sm font-medium">{module.name}</p>
              <p className="text-xs text-muted-foreground">{module.detail}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-xl border border-border/70 bg-background/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace roles
          </p>
          <ul className="mt-3 space-y-2">
            {MARKETING.roles.map((role) => (
              <li key={role} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <span>{role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Shield className="mt-0.5 size-3.5 shrink-0 text-accent" />
        <span>
          {mode === "register"
            ? "New accounts require email verification before first sign-in."
            : MARKETING.securityNote}
        </span>
      </div>
    </aside>
  );
}

export function AuthMarketingMobile({ mode }: AuthSidePanelsProps) {
  return (
    <div className="mb-6 space-y-4 lg:hidden">
      <div className="rounded-xl border border-border/70 bg-card/55 p-4 backdrop-blur-md">
        <p className="text-sm font-medium">TransitOps</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{MARKETING.intro}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {MARKETING.modules.slice(0, mode === "register" ? 4 : 2).map((module) => (
          <div
            key={module.name}
            className="rounded-lg border border-border/60 bg-card/45 px-3 py-2.5"
          >
            <p className="text-xs font-medium">{module.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{module.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
