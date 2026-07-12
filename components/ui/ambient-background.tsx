"use client";

export function AmbientBackground() {
  return (
    <div aria-hidden className="ambient-background pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />
      <div className="ambient-orb ambient-orb-three" />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
    </div>
  );
}
