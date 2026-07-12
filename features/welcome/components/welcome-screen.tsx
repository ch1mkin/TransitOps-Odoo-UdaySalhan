import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AboutTrigger } from "@/components/about/about-trigger";
import { buttonVariants } from "@/components/ui/button";
import { MARKETING } from "@/constants/marketing";
import { cn } from "@/lib/utils";

const WORKSPACE_TABS = ["Dashboard", "Vehicles", "Drivers", "Trips", "Reports"];

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="welcome-rail pointer-events-none absolute inset-y-0 left-0 hidden w-1 bg-gradient-to-b from-accent/50 via-cyan-400/30 to-transparent lg:block" />
      <div className="welcome-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-80" />

      <header className="relative border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo variant="icon" size={34} className="rounded-lg" priority />
            <span className="text-sm font-semibold tracking-tight">TransitOps</span>
          </Link>
          <div className="flex items-center gap-1">
            <AboutTrigger />
            <Link href="/auth" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pt-20">
        <section className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Fleet &amp; transport operations
            </p>

            <h1 className="mt-4 max-w-xl text-[2.35rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              One workspace for vehicles, drivers, and every trip on the road.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              {MARKETING.intro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/auth?mode=register"
                className={cn(buttonVariants({ size: "lg" }), "welcome-cta-primary px-6")}
              >
                Create account
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/auth"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "text-foreground"
                )}
              >
                Sign in
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="welcome-app-preview rounded-2xl border border-border/80 bg-card/70 p-1 backdrop-blur-sm workspace-shadow">
            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
              <span className="size-2 rounded-full bg-red-400/80" />
              <span className="size-2 rounded-full bg-amber-400/80" />
              <span className="size-2 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                transitops.app/workspace
              </span>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-border/60 px-2 py-1.5 scrollbar-none">
              {WORKSPACE_TABS.map((tab, index) => (
                <span
                  key={tab}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium",
                    index === 2
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div className="space-y-3 p-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Vehicles ready", value: "18" },
                  { label: "Drivers on trip", value: "6" },
                  { label: "Open maintenance", value: "2" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                  >
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-mono text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/40">
                <div className="grid grid-cols-[1.2fr_1fr_0.8fr] gap-2 border-b border-border/50 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Trip</span>
                  <span>Route</span>
                  <span>Status</span>
                </div>
                {[
                  { id: "TR-1048", route: "Pune → Mumbai", status: "Dispatched" },
                  { id: "TR-1049", route: "Nagpur → Indore", status: "Draft" },
                  { id: "TR-1050", route: "Delhi → Jaipur", status: "Completed" },
                ].map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1.2fr_1fr_0.8fr] gap-2 border-b border-border/40 px-3 py-2.5 text-xs last:border-b-0"
                  >
                    <span className="font-mono font-medium">{row.id}</span>
                    <span className="text-muted-foreground">{row.route}</span>
                    <span className="text-accent">{row.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 border-t border-border/60 pt-14">
          <h2 className="text-lg font-semibold tracking-tight">How teams use TransitOps</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {MARKETING.workflow.map((item) => (
              <article key={item.step} className="relative pl-5">
                <span className="absolute left-0 top-1 font-mono text-xs font-semibold text-accent">
                  {item.step}
                </span>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-lg font-semibold tracking-tight">Modules in the workspace</h2>
          <div className="mt-6 divide-y divide-border/70 rounded-xl border border-border/70 bg-card/50">
            {MARKETING.modules.map((module) => (
              <div
                key={module.name}
                className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <p className="text-sm font-medium">{module.name}</p>
                <p className="text-sm text-muted-foreground sm:text-right">{module.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-5">
        <p className="text-center text-xs text-muted-foreground">
          TransitOps · Built for day-to-day transport operations
        </p>
      </footer>
    </div>
  );
}
