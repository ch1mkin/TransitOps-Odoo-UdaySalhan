import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Route,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AboutTrigger } from "@/components/about/about-trigger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Truck,
    title: "Fleet operations",
    description: "Vehicles, maintenance, documents, and compliance in one workspace.",
    accent: "from-blue-500/20 to-cyan-400/10",
  },
  {
    icon: Route,
    title: "Trip dispatch",
    description: "Plan, dispatch, and complete trips with enforced business rules.",
    accent: "from-cyan-500/20 to-teal-400/10",
  },
  {
    icon: BarChart3,
    title: "Analytics & ROI",
    description: "Fuel efficiency, costs, and performance insights for your fleet.",
    accent: "from-indigo-500/20 to-blue-400/10",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst views.",
    accent: "from-violet-500/20 to-indigo-400/10",
  },
];

const HIGHLIGHTS = [
  "Live trip tracking",
  "Document compliance",
  "Fuel & expense control",
  "Role-based dashboards",
];

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="welcome-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[34rem]" />

      <header className="relative border-b border-border/60 bg-card/55 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo variant="icon" size={36} className="rounded-xl" priority />
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

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Sparkles className="size-3.5" />
              Smart Transport Operations
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="welcome-gradient-text">Run your fleet</span>
              <br />
              like a modern logistics company
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              TransitOps replaces spreadsheets and manual logbooks with a centralized
              platform for vehicles, drivers, trips, fuel, expenses, and analytics —
              built for Indian transport operations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth?mode=register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "welcome-cta-primary group shadow-lg shadow-accent/20"
                )}
              >
                Create account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-border/80 bg-card/60 backdrop-blur-sm"
                )}
              >
                Sign in
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {HIGHLIGHTS.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border/70 bg-card/65 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="welcome-showcase relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="welcome-showcase-card glass-card workspace-shadow rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Operations pulse
                  </p>
                  <p className="mt-1 text-2xl font-semibold">Fleet ready</p>
                </div>
                <BrandLogo variant="icon" size={48} className="rounded-2xl" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Active trips", value: "24/7" },
                  { label: "Compliance", value: "Live" },
                  { label: "Fuel tracking", value: "Smart" },
                  { label: "Team roles", value: "4+" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/70 bg-background/50 px-4 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-r from-accent/15 via-cyan-400/10 to-indigo-500/15 px-4 py-3 text-sm text-muted-foreground">
                Dispatch, monitor, and close trips with one connected workspace.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-accent">
              Platform capabilities
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything your transport team needs
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="welcome-feature-card glass-card workspace-shadow group rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-accent",
                      feature.accent
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/60 bg-card/40 py-6 backdrop-blur-md">
        <p className="text-center text-xs text-muted-foreground">
          TransitOps · Fleet &amp; transport operations platform
        </p>
      </footer>
    </div>
  );
}
