import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/constants/roles";
import { walkthroughKey } from "@/lib/walkthrough/steps";

interface WalkthroughState {
  completed: Record<string, true>;
  lastSeenRoleByUser: Record<string, Role>;
  isActive: boolean;
  stepIndex: number;
  start: () => void;
  next: (totalSteps: number) => void;
  skip: (userId: string, role: Role) => void;
  finish: (userId: string, role: Role) => void;
  isCompleted: (userId: string, role: Role) => boolean;
  setLastSeenRole: (userId: string, role: Role) => void;
  getLastSeenRole: (userId: string) => Role | undefined;
  resetForRole: (userId: string, role: Role) => void;
}

export const useWalkthroughStore = create<WalkthroughState>()(
  persist(
    (set, get) => ({
      completed: {},
      lastSeenRoleByUser: {},
      isActive: false,
      stepIndex: 0,

      start: () => set({ isActive: true, stepIndex: 0 }),

      next: (totalSteps) =>
        set((state) => {
          const nextIndex = state.stepIndex + 1;
          if (nextIndex >= totalSteps) {
            return { isActive: false, stepIndex: 0 };
          }
          return { stepIndex: nextIndex };
        }),

      skip: (userId, role) =>
        set((state) => ({
          isActive: false,
          stepIndex: 0,
          completed: { ...state.completed, [walkthroughKey(userId, role)]: true },
        })),

      finish: (userId, role) =>
        set((state) => ({
          isActive: false,
          stepIndex: 0,
          completed: { ...state.completed, [walkthroughKey(userId, role)]: true },
        })),

      isCompleted: (userId, role) =>
        Boolean(get().completed[walkthroughKey(userId, role)]),

      setLastSeenRole: (userId, role) =>
        set((state) => ({
          lastSeenRoleByUser: { ...state.lastSeenRoleByUser, [userId]: role },
        })),

      getLastSeenRole: (userId) => get().lastSeenRoleByUser[userId],

      resetForRole: (userId, role) =>
        set((state) => {
          const key = walkthroughKey(userId, role);
          const { [key]: _, ...rest } = state.completed;
          return { completed: rest as Record<string, true> };
        }),
    }),
    { name: "transitops-walkthrough" }
  )
);
