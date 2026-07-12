"use client";

import { useEffect, useRef } from "react";
import { resolveTheme, useThemeStore } from "@/store/theme-store";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    size: Math.random() * 1.6 + 0.6,
  }));
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrame = 0;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const isDark = () => resolveTheme(mode) === "dark";

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(width, height, Math.floor((width * height) / 18000));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const dark = isDark();
      const dotColor = dark ? "rgba(96, 165, 250, 0.75)" : "rgba(37, 99, 235, 0.55)";
      const linkDistance = 120;

      for (const particle of particles) {
        if (!reducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x <= 0 || particle.x >= width) particle.vx *= -1;
          if (particle.y <= 0 || particle.y >= height) particle.vy *= -1;
        }

        context.beginPath();
        context.fillStyle = dotColor;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);

          if (distance < linkDistance) {
            const opacity = 1 - distance / linkDistance;
            context.beginPath();
            context.strokeStyle = dark
              ? `rgba(56, 189, 248, ${0.18 * opacity})`
              : `rgba(37, 99, 235, ${0.12 * opacity})`;
            context.lineWidth = 0.8;
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="ambient-particles absolute inset-0" />;
}

export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-background pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />
      <div className="ambient-orb ambient-orb-three" />
      <div className="ambient-grid" />
      <ParticleCanvas />
      <div className="ambient-noise" />
    </div>
  );
}
