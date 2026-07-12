import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AboutTrigger } from "@/components/about/about-trigger";
import { buttonVariants } from "@/components/ui/button";
import { ABOUT } from "@/constants/about";
import { cn } from "@/lib/utils";

export function WelcomeScreen() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="welcome-rail pointer-events-none absolute inset-y-0 left-0 hidden w-1 bg-gradient-to-b from-accent/50 via-cyan-400/30 to-transparent lg:block" />
      <div className="welcome-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[24rem] opacity-70" />

      <header className="relative border-b border-border/50">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
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

      <main className="relative mx-auto max-w-3xl px-6 pb-16 pt-12 sm:pt-16">
        <section>
          <p className="inline-flex rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            {ABOUT.event} · {ABOUT.theme}
          </p>

          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {ABOUT.product}
          </h1>

          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{ABOUT.subtitle}</p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Built by <span className="font-medium text-foreground">{ABOUT.builder}</span> as an
            entry for <span className="font-medium text-foreground">{ABOUT.event}</span>. This page
            describes the real problem explored and what was implemented in the project — not live
            production fleet data.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth?mode=register"
              className={cn(buttonVariants({ size: "lg" }), "welcome-cta-primary px-6")}
            >
              Try the workspace
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
        </section>

        <section className="mt-14 border-t border-border/60 pt-12">
          <h2 className="text-lg font-semibold tracking-tight">{ABOUT.problem.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {ABOUT.problem.summary}
          </p>
          <ul className="mt-5 space-y-3">
            {ABOUT.problem.points.map((point) => (
              <li
                key={point}
                className="border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground"
              >
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-border/60 pt-12">
          <h2 className="text-lg font-semibold tracking-tight">{ABOUT.solution.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {ABOUT.solution.summary}
          </p>
          <ul className="mt-5 space-y-3">
            {ABOUT.solution.points.map((point) => (
              <li
                key={point}
                className="border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-muted-foreground"
              >
                {point}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 border-t border-border/60 pt-12">
          <h2 className="text-lg font-semibold tracking-tight">What was built</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Features implemented in this hackathon prototype:
          </p>
          <ul className="mt-5 space-y-2.5">
            {ABOUT.implemented.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs text-muted-foreground">{ABOUT.stack}</p>
        </section>
      </main>

      <footer className="border-t border-border/50 py-5">
        <p className="text-center text-xs text-muted-foreground">
          {ABOUT.product} · {ABOUT.builder} · {ABOUT.event}
        </p>
      </footer>
    </div>
  );
}
