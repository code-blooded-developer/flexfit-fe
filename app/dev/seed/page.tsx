"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { FlaskConical, RotateCcw, Timer, Trash2 } from "lucide-react";

import { USE_MOCKS } from "@/lib/mock/config";
import { workoutService } from "@/services/workoutService";
import type { Workout } from "@/types/workout";

/**
 * Reviewer tooling for `NEXT_PUBLIC_USE_MOCKS=1`.
 *
 * Seeds `flexfit.session` with the exact blob a force-kill would leave behind,
 * so the overnight bug can be reproduced in seconds instead of hours. Always
 * hard-navigates afterwards: client-side routing keeps the in-memory store and
 * would mask the rehydration path.
 */

const SESSION_KEY = "flexfit.session";
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

type Seed = {
  status: "idle" | "running" | "paused" | "completed";
  workoutId: string;
  date: string;
  startedAt: number;
  completedAt: null;
  accumulatedMs: number;
  runningSince: number | null;
  skippedExerciseIds: string[];
  completedExerciseIds: string[];
  rest: null | {
    endsAt: number | null;
    remainingMs: number;
    durationSeconds: number;
    next: { exerciseId: string; setNumber: number } | null;
    catchUpExerciseId: string | null;
    completedExerciseId: string | null;
  };
  /** Forward-compatible: current code ignores it, a heartbeat fix will read it. */
  lastSeenAt?: number;
};

function writeSession(state: Seed) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ state, version: 1 }),
  );
  window.location.assign("/workout");
}

export default function MockSeedPage() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dump, setDump] = useState("");

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const current = await workoutService.getTodayWorkout();
      setWorkout(current);
      setDump(localStorage.getItem(SESSION_KEY) ?? "(nothing stored)");
    } catch {
      setError("Could not reach the fixture API. Is NEXT_PUBLIC_USE_MOCKS=1 set?");
    }
  }, []);

  useEffect(() => {
    if (!USE_MOCKS) return;
    // Deferred a tick: the mount render should settle before the fixture read
    // lands, and it keeps setState out of the effect body.
    const id = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(id);
  }, [refresh]);

  const seed = (build: (workout: Workout) => Seed) => {
    if (!workout) return;
    writeSession(build(workout));
  };

  const resetFixtures = async () => {
    await fetch("/api/v1/__mock/reset", { method: "POST" });
    localStorage.removeItem(SESSION_KEY);
    await refresh();
  };

  if (!USE_MOCKS) {
    return (
      <div className="min-h-dvh bg-background text-foreground px-6 pt-14">
        <h1 className="font-display text-2xl font-bold">Mock mode is off</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Restart with{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5">
            bun run dev:mock
          </code>
        </p>
      </div>
    );
  }

  const mainExercise =
    workout?.exercises.find((ex) => ex.phase === "MAIN") ??
    workout?.exercises[0];

  return (
    <div className="min-h-dvh bg-background text-foreground px-6 pt-14 pb-16">
      <div className="flex items-center gap-2 text-primary">
        <FlaskConical size={16} />
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
          Fixtures
        </span>
      </div>
      <h1 className="mt-2 font-display text-2xl font-bold">Session scenarios</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Writes <code className="rounded bg-secondary px-1 py-0.5">flexfit.session</code>{" "}
        and reloads. Clear between runs.
      </p>

      {error && (
        <p className="mt-4 rounded-2xl border border-destructive/40 bg-card p-3 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Scenario
          title="Overnight — 14h away after 45 min"
          detail="Expect: a few minutes at most, paused. A 14h clock means the bug is still there."
          onClick={() =>
            seed((w) => {
              const now = Date.now();
              return {
                status: "running",
                workoutId: w.id,
                date: w.date,
                startedAt: now - 14 * HOUR,
                completedAt: null,
                accumulatedMs: 0,
                runningSince: now - 14 * HOUR,
                lastSeenAt: now - 14 * HOUR + 45 * MINUTE,
                skippedExerciseIds: [],
                completedExerciseIds: [],
                rest: null,
              };
            })
          }
        />

        <Scenario
          title="Stale — running for 30h"
          detail="Expect: no Resume button at all, a clean Start Workout. Past 24h the session is not training."
          onClick={() =>
            seed((w) => {
              const now = Date.now();
              // `date` stays today on purpose: if it were yesterday the session
              // would fail the workout-id match anyway and the 24h rule would
              // never be exercised.
              return {
                status: "running",
                workoutId: w.id,
                date: w.date,
                startedAt: now - 30 * HOUR,
                completedAt: null,
                accumulatedMs: 0,
                runningSince: now - 30 * HOUR,
                skippedExerciseIds: [],
                completedExerciseIds: [],
                rest: null,
              };
            })
          }
        />

        <Scenario
          title="Quick switch — 30 min in, 5 s away"
          detail="Expect: still running, roughly 30s added. This is the grace window."
          onClick={() =>
            seed((w) => {
              const now = Date.now();
              return {
                status: "running",
                workoutId: w.id,
                date: w.date,
                startedAt: now - 30 * MINUTE,
                completedAt: null,
                accumulatedMs: 0,
                runningSince: now - 30 * MINUTE,
                lastSeenAt: now - 5_000,
                skippedExerciseIds: [],
                completedExerciseIds: [],
                rest: null,
              };
            })
          }
        />

        <Scenario
          title="Paused — 47 min banked"
          detail="Baseline: the paused state should survive a reload untouched."
          onClick={() =>
            seed((w) => {
              const now = Date.now();
              return {
                status: "paused",
                workoutId: w.id,
                date: w.date,
                startedAt: now - 2 * HOUR,
                completedAt: null,
                accumulatedMs: 47 * MINUTE,
                runningSince: null,
                skippedExerciseIds: [],
                completedExerciseIds: [],
                rest: null,
              };
            })
          }
        />

        <Scenario
          title="Mid-rest — 2.5s left"
          detail="Expect: the rest screen resolves itself with no tap, even after a reload."
          onClick={() =>
            seed((w) => {
              const now = Date.now();
              const next = w.exercises[1] ?? w.exercises[0];
              return {
                status: "running",
                workoutId: w.id,
                date: w.date,
                startedAt: now - 10 * MINUTE,
                completedAt: null,
                accumulatedMs: 0,
                runningSince: now - 10 * MINUTE,
                skippedExerciseIds: [],
                completedExerciseIds: [],
                rest: {
                  endsAt: now + 2_500,
                  remainingMs: 2_500,
                  durationSeconds: 90,
                  next: { exerciseId: next.id, setNumber: next.sets.length + 1 },
                  catchUpExerciseId: null,
                  completedExerciseId: null,
                },
              };
            })
          }
        />

        <Scenario
          title="Almost done — one exercise left"
          detail="Skips straight to the last exercise. Press Resume workout, then Done, to run the completion path."
          onClick={() =>
            seed((w) => {
              const now = Date.now();
              // The fixture payload is already phase-ordered, so everything but
              // the last entry counts as done — the remaining one is the stretch
              // block, which is the shortest to press through.
              return {
                status: "running",
                workoutId: w.id,
                date: w.date,
                startedAt: now - 20 * MINUTE,
                completedAt: null,
                accumulatedMs: 0,
                runningSince: now - 20 * MINUTE,
                skippedExerciseIds: [],
                completedExerciseIds: w.exercises
                  .slice(0, -1)
                  .map((ex) => ex.id),
                rest: null,
              };
            })
          }
        />

        <Scenario
          title="Clear session"
          detail="Removes flexfit.session so the next scenario starts clean."
          icon={<Trash2 size={16} />}
          onClick={() => {
            localStorage.removeItem(SESSION_KEY);
            window.location.assign("/workout");
          }}
        />
      </div>

      <h2 className="mt-10 font-display text-lg font-bold">Current fixtures</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Workout {workout?.id ?? "—"}
        {mainExercise ? ` · first exercise ${mainExercise.id}` : ""}
      </p>
      <pre className="mt-3 max-h-64 overflow-auto rounded-2xl border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground">
        {dump}
      </pre>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => void refresh()}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          <Timer size={16} />
          Refresh
        </button>
        <button
          onClick={() => void resetFixtures()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold"
        >
          <RotateCcw size={16} />
          Reset fixtures and session
        </button>
      </div>
    </div>
  );
}

function Scenario({
  title,
  detail,
  onClick,
  icon,
}: {
  title: string;
  detail: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-2xl border border-border bg-card px-4 py-3 text-left"
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        {icon ?? <FlaskConical size={16} className="text-primary" />}
        {title}
      </span>
      <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
        {detail}
      </span>
    </motion.button>
  );
}
