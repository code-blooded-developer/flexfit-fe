import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { SessionStep } from "@/lib/session";

export type SessionStatus = "idle" | "running" | "paused" | "completed";

export type RestState = {
  /** Epoch ms the countdown ends, or null while the session is paused. */
  endsAt: number | null;
  /** What is left on the clock — authoritative only while `endsAt` is null. */
  remainingMs: number;
  durationSeconds: number;
  /** Where rest ends up; null means the workout is finished. */
  next: SessionStep | null;
  /** Exercise that can still be logged from the rest screen, if any. */
  catchUpExerciseId: string | null;
  /** Exercise finished with "Done" — the rest screen offers an undo. */
  completedExerciseId: string | null;
};

type StartRestInput = {
  durationSeconds: number;
  next: SessionStep | null;
  catchUpExerciseId?: string | null;
  completedExerciseId?: string | null;
};

type SessionStore = {
  /** False until localStorage has been read, so pages don't guess. */
  hydrated: boolean;
  status: SessionStatus;
  workoutId: string | null;
  date: string | null;
  startedAt: number | null;
  completedAt: number | null;
  accumulatedMs: number;
  runningSince: number | null;
  lastSeenAt: number | null;
  /** Exercises the user moved past without finishing. */
  skippedExerciseIds: string[];
  /** Exercises the user marked done, even if sets were left unlogged. */
  completedExerciseIds: string[];
  rest: RestState | null;

  setHydrated: () => void;
  start: (workoutId: string, date: string) => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  clear: () => void;
  skipExercise: (exerciseId: string) => void;
  completeExercise: (exerciseId: string) => void;
  uncompleteExercise: (exerciseId: string) => void;
  startRest: (input: StartRestInput) => void;
  clearRest: () => void;
};

/** Maximum time the app can be away/closed while running that is counted as training time. */
const CLOSED_GRACE_MS = 2 * 60_000;

/** A session started or untouched for longer than this is stale and should not be resumed. */
const STALE_AFTER_MS = 24 * 60 * 60_000;

const EMPTY = {
  status: "idle" as SessionStatus,
  workoutId: null,
  date: null,
  startedAt: null,
  completedAt: null,
  accumulatedMs: 0,
  runningSince: null,
  lastSeenAt: null,
  skippedExerciseIds: [] as string[],
  completedExerciseIds: [] as string[],
  rest: null,
};

function freezeRest(rest: RestState | null, now: number): RestState | null {
  if (!rest || rest.endsAt === null) return rest;
  return {
    ...rest,
    remainingMs: Math.max(rest.endsAt - now, 0),
    endsAt: null,
  };
}

function thawRest(rest: RestState | null, now: number): RestState | null {
  if (!rest || rest.endsAt !== null) return rest;
  return { ...rest, endsAt: now + rest.remainingMs };
}

/**
 * Elapsed workout time. Banked milliseconds plus whatever has run since the
 * last resume — never a counter, so throttled timers can't lose time.
 */
export function sessionElapsedMs(state: {
  accumulatedMs: number;
  runningSince: number | null;
}): number {
  return (
    state.accumulatedMs +
    (state.runningSince !== null ? Date.now() - state.runningSince : 0)
  );
}

export function restRemainingMs(rest: RestState): number {
  return rest.endsAt !== null
    ? Math.max(rest.endsAt - Date.now(), 0)
    : Math.max(rest.remainingMs, 0);
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...EMPTY,

      setHydrated: () => set({ hydrated: true }),

      start: (workoutId, date) => {
        const now = Date.now();
        set({
          ...EMPTY,
          status: "running",
          workoutId,
          date,
          startedAt: now,
          runningSince: now,
          lastSeenAt: now,
        });
      },

      pause: () => {
        const state = get();
        if (state.status !== "running") return;
        const now = Date.now();
        set({
          status: "paused",
          accumulatedMs:
            state.accumulatedMs +
            (state.runningSince !== null ? now - state.runningSince : 0),
          runningSince: null,
          lastSeenAt: now,
          rest: freezeRest(state.rest, now),
        });
      },

      resume: () => {
        const state = get();
        if (state.status !== "paused") return;
        const now = Date.now();
        set({
          status: "running",
          runningSince: now,
          lastSeenAt: now,
          rest: thawRest(state.rest, now),
        });
      },

      finish: () => {
        const state = get();
        if (state.status === "idle" || state.status === "completed") return;
        const now = Date.now();
        set({
          status: "completed",
          completedAt: now,
          accumulatedMs:
            state.accumulatedMs +
            (state.runningSince !== null ? now - state.runningSince : 0),
          runningSince: null,
          lastSeenAt: now,
          rest: null,
        });
      },

      clear: () => set({ ...EMPTY, hydrated: get().hydrated }),

      skipExercise: (exerciseId) =>
        set((state) => ({
          completedExerciseIds: state.completedExerciseIds.filter(
            (id) => id !== exerciseId,
          ),
          skippedExerciseIds: state.skippedExerciseIds.includes(exerciseId)
            ? state.skippedExerciseIds
            : [...state.skippedExerciseIds, exerciseId],
        })),

      completeExercise: (exerciseId) =>
        set((state) => ({
          // Doing it after all wins over an earlier skip.
          skippedExerciseIds: state.skippedExerciseIds.filter(
            (id) => id !== exerciseId,
          ),
          completedExerciseIds: state.completedExerciseIds.includes(exerciseId)
            ? state.completedExerciseIds
            : [...state.completedExerciseIds, exerciseId],
        })),

      uncompleteExercise: (exerciseId) =>
        set((state) => ({
          completedExerciseIds: state.completedExerciseIds.filter(
            (id) => id !== exerciseId,
          ),
        })),

      startRest: ({
        durationSeconds,
        next,
        catchUpExerciseId = null,
        completedExerciseId = null,
      }) => {
        const durationMs = durationSeconds * 1000;
        set({
          rest: {
            endsAt: Date.now() + durationMs,
            remainingMs: durationMs,
            durationSeconds,
            next,
            catchUpExerciseId,
            completedExerciseId,
          },
        });
      },

      clearRest: () => set({ rest: null }),
    }),
    {
      name: "flexfit.session",
      version: 1,
      // Read in app/provider.tsx so server and client render the same first frame.
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const stored = persistedState as Partial<SessionStore> | undefined;
        if (!stored) return currentState;

        const now = Date.now();
        const merged = { ...currentState, ...stored };

        // 1. Stale session: older than 24 hours -> reset to clean state
        if (
          merged.startedAt !== null &&
          now - merged.startedAt > STALE_AFTER_MS
        ) {
          return { ...currentState };
        }

        // 2. If it was not running, keep state as-is (e.g. paused sessions remain exact)
        if (merged.status !== "running" || merged.runningSince === null) {
          return merged;
        }

        // 3. Closed while running: bank proven running time (if lastSeenAt exists),
        // and cap the unproven gap to grace period (at most CLOSED_GRACE_MS).
        const rawLastSeen = (stored as { lastSeenAt?: unknown }).lastSeenAt;
        const lastSeen =
          typeof rawLastSeen === "number" && rawLastSeen > merged.runningSince
            ? Math.min(rawLastSeen, now)
            : merged.runningSince;

        const provenTime = Math.max(lastSeen - merged.runningSince, 0);
        const unprovenGap = Math.max(now - lastSeen, 0);
        const graceBuffer = Math.min(unprovenGap, CLOSED_GRACE_MS);

        return {
          ...merged,
          status: "paused",
          accumulatedMs: merged.accumulatedMs + provenTime + graceBuffer,
          runningSince: null,
          lastSeenAt: now,
          rest: freezeRest(merged.rest, now),
        };
      },
      partialize: (state) => ({
        status: state.status,
        workoutId: state.workoutId,
        date: state.date,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        accumulatedMs: state.accumulatedMs,
        runningSince: state.runningSince,
        lastSeenAt: state.lastSeenAt,
        skippedExerciseIds: state.skippedExerciseIds,
        completedExerciseIds: state.completedExerciseIds,
        rest: state.rest,
      }),
    },
  ),
);
