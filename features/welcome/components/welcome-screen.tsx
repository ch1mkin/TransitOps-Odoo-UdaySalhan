import Link from "next/link";
import {
  BarChart3,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Truck,
    title: "Fleet operations",
    description: "Vehicles, maintenance, documents, and compliance in one workspace.",
  },
  {
    icon: Route,
    title: "Trip dispatch",
    description: "Plan, dispatch, and complete trips with enforced business rules.",
  },
  {
    icon: BarChart3,
    title: "Analytics & ROI",
    description: "Fuel efficiency, costs, and performance insights for your fleet.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst views.",
  },
];

export function WelcomeScreen() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo variant="icon" size={36} className="rounded-xl" priority />
            <span className="text-sm font-semibold tracking-tight">TransitOps</span>
          </Link>
          <Link href="/auth" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            Smart Transport Operations
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Run your fleet like a modern logistics company
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            TransitOps replaces spreadsheets and manual logbooks with a centralized
            platform for vehicles, drivers, trips, fuel, expenses, and analytics —
            built for Indian transport operations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth?mode=register"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Create account
            </Link>
            <Link
              href="/auth"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-5 workspace-shadow"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-4" />
                </div>
                <h2 className="mt-3 text-sm font-semibold">{feature.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted-foreground">
          TransitOps · Fleet &amp; transport operations platform
        </p>
      </footer>
    </div>
  );
}
