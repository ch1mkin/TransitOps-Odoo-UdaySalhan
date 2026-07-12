"use client";

import { useEffect, useMemo } from "react";
import { WALKTHROUGH_PENDING_KEY } from "@/constants/walkthrough";
import type { Role } from "@/constants/roles";
import { buildWalkthroughSteps } from "@/lib/walkthrough/steps";
import { WalkthroughOverlay } from "@/components/walkthrough/walkthrough-overlay";
import { useWalkthroughStore } from "@/store/walkthrough-store";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceWalkthroughProps {
  userId: string;
  role: Role;
}

function ensureSidebarExpanded() {
  if (useWorkspaceStore.getState().sidebarCollapsed) {
    useWorkspaceStore.getState().toggleSidebar();
  }
}

export function WorkspaceWalkthrough({ userId, role }: WorkspaceWalkthroughProps) {
  const steps = useMemo(() => buildWalkthroughSteps(role), [role]);
  const isActive = useWalkthroughStore((s) => s.isActive);
  const stepIndex = useWalkthroughStore((s) => s.stepIndex);
  const start = useWalkthroughStore((s) => s.start);
  const next = useWalkthroughStore((s) => s.next);
  const skip = useWalkthroughStore((s) => s.skip);
  const finish = useWalkthroughStore((s) => s.finish);
  const isCompleted = useWalkthroughStore((s) => s.isCompleted);
  const getLastSeenRole = useWalkthroughStore((s) => s.getLastSeenRole);
  const setLastSeenRole = useWalkthroughStore((s) => s.setLastSeenRole);

  useEffect(() => {
    const pending = sessionStorage.getItem(WALKTHROUGH_PENDING_KEY);
    const lastRole = getLastSeenRole(userId);
    const roleChanged = lastRole != null && lastRole !== role;
    const shouldStart =
      !isCompleted(userId, role) && (pending === "1" || roleChanged);

    if (pending === "1") {
      sessionStorage.removeItem(WALKTHROUGH_PENDING_KEY);
    }

    setLastSeenRole(userId, role);

    if (shouldStart) {
      ensureSidebarExpanded();
      const timer = window.setTimeout(() => start(), 450);
      return () => window.clearTimeout(timer);
    }
  }, [userId, role, getLastSeenRole, isCompleted, setLastSeenRole, start]);

  useEffect(() => {
    if (!isActive) return;
    ensureSidebarExpanded();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive, stepIndex]);

  if (!isActive || steps.length === 0) {
    return null;
  }

  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const handleNext = () => {
    if (stepIndex >= steps.length - 1) {
      finish(userId, role);
      return;
    }
    next(steps.length);
  };

  return (
    <WalkthroughOverlay
      step={step}
      stepIndex={stepIndex}
      totalSteps={steps.length}
      onNext={handleNext}
      onSkip={() => skip(userId, role)}
    />
  );
}
