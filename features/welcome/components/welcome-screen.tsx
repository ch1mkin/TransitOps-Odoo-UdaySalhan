import Link from "next/link";
import { ArrowRight, ChevronRight, User } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AboutTrigger } from "@/components/about/about-trigger";
import { buttonVariants } from "@/components/ui/button";
import { ABOUT } from "@/constants/about";
import { cn } from "@/lib/utils";

const ROADMAP = [
  {
    phase: "01",
    title: ABOUT.problem.title,
    summary: ABOUT.problem.summary,
    items: ABOUT.problem.points,
    tone: "muted" as const,
  },
  {
    phase: "02",
    title: ABOUT.solution.title,
    summary: ABOUT.solution.summary,
    items: ABOUT.solution.points,
    tone: "accent" as const,
  },
  {
    phase: "03",
    title: "What was built",
    summary: "Features implemented in this hackathon prototype:",
    items: ABOUT.implemented,
    tone: "success" as const,
  },
];

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="welcome-rail pointer-events-none absolute inset-y-0 left-0 hidden w-1 bg-gradient-to-b from-accent/50 via-cyan-400/30 to-transparent lg:block" />
      <div className="welcome-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-80" />

      <header className="relative border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
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

      <section className="welcome-hero relative border-b border-border/50">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="welcome-hero-card glass-card workspace-shadow rounded-3xl p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-accent" />
                  {ABOUT.event}
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <BrandLogo variant="icon" size={64} className="rounded-2xl" priority />
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                      <span className="welcome-gradient-text">{ABOUT.product}</span>
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">{ABOUT.theme}</p>
                  </div>
                </div>

                <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {ABOUT.subtitle}
                </p>

                <div className="welcome-builder-badge mt-6 inline-flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/60 px-4 py-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
                    <User className="size-4" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Project by
                    </p>
                    <p className="text-sm font-semibold">{ABOUT.builder}</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto lg:min-w-[15rem]">
                <Link
                  href="/auth?mode=register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "welcome-cta-primary h-11 justify-center px-6"
                  )}
                >
                  Try the workspace
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/auth"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 justify-center border-border/80 bg-card/50"
                  )}
                >
                  Sign in
                  <ChevronRight className="size-4" />
                </Link>
                <p className="text-center text-[11px] leading-relaxed text-muted-foreground lg:text-left">
                  Hackathon prototype — not live production fleet data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Project roadmap</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            From problem to working prototype
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            How {ABOUT.builder}&apos;s {ABOUT.event} entry frames the transport operations challenge
            and the solution built in TransitOps.
          </p>
        </div>

        <div className="welcome-roadmap">
          {ROADMAP.map((step, index) => (
            <article key={step.phase} className="welcome-roadmap-step">
              <div className="welcome-roadmap-rail">
                <div
                  className={cn(
                    "welcome-roadmap-node",
                    step.tone === "accent" && "welcome-roadmap-node-accent",
                    step.tone === "success" && "welcome-roadmap-node-success"
                  )}
                >
                  <span>{step.phase}</span>
                </div>
                {index < ROADMAP.length - 1 ? <div className="welcome-roadmap-line" /> : null}
              </div>

              <div className="welcome-roadmap-card glass-card workspace-shadow rounded-2xl p-6 sm:p-7">
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Phase {step.phase}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.summary}</p>

                <ul className="mt-5 space-y-3">
                  {step.items.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-sm leading-relaxed text-muted-foreground",
                        step.tone === "muted" && "border-border/70 bg-background/40",
                        step.tone === "accent" && "border-accent/20 bg-accent/5",
                        step.tone === "success" && "border-emerald-500/20 bg-emerald-500/5"
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <section className="welcome-roadmap-final mt-12 rounded-2xl border border-border/70 bg-card/50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Phase 04 · Explore
              </p>
              <h3 className="mt-2 text-lg font-semibold">Open the workspace</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Sign in or create an account to walk through the modules {ABOUT.builder} built for
                this hackathon submission.
              </p>
              <p className="mt-4 font-mono text-xs text-muted-foreground">{ABOUT.stack}</p>
            </div>
            <Link
              href="/auth?mode=register"
              className={cn(buttonVariants({ size: "lg" }), "welcome-cta-primary shrink-0")}
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-card/30 py-6 backdrop-blur-md">
        <p className="text-center text-xs text-muted-foreground">
          {ABOUT.product} · {ABOUT.builder} · {ABOUT.event}
        </p>
      </footer>
    </div>
  );
}
