"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dumbbell,
  Loader2,
  Play,
  SkipForward,
  Undo2,
} from "lucide-react";

import LogSetSheet from "@/components/LogSetSheet";
import SessionClock from "@/components/SessionClock";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionClock } from "@/hooks/useSession";
import { useDeleteSet, useLogSet, useWorkout } from "@/hooks/workout";
import { useSessionStore } from "@/store/sessionStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { exerciseById, formatSessionTime, targetSetCount } from "@/lib/session";
import {
  MUSCLE_GROUP_EMOJI,
  MUSCLE_GROUP_NAMES,
} from "@/app/(protected)/(main)/workout/_lib/workout-sections";
import type { WorkoutSetInput } from "@/types/workout";

const RING_SIZE = 216;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Rounds up, so a countdown doesn't sit on 0:00 while time remains. */
const formatCountdown = (ms: number) =>
  formatSessionTime(Math.ceil(ms / 1000) * 1000);

/** Next screen after a rest: the pending exercise, or the summary. */
const destination = (exerciseId: string | undefined) =>
  exerciseId ? `/exercise?exerciseId=${exerciseId}` : "/complete";

export default function RestView() {
  const router = useRouter();

  // Hydrates the workout for the "next up" preview when opened directly.
  useWorkout();

  const hydrated = useSessionStore((s) => s.hydrated);
  const status = useSessionStore((s) => s.status);
  const rest = useSessionStore((s) => s.rest);
  const workoutId = useSessionStore((s) => s.workoutId);
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);
  const clearRest = useSessionStore((s) => s.clearRest);
  const uncompleteExercise = useSessionStore((s) => s.uncompleteExercise);

  const workout = useWorkoutStore((s) => s.todayWorkout);
  const workoutLoading = useWorkoutStore((s) => s.isLoading);

  const { elapsedMs, restRemainingMs, restProgress } = useSessionClock();

  const logSet = useLogSet();
  const deleteSet = useDeleteSet();
  const [logOpen, setLogOpen] = useState(false);
  const leaving = useRef(false);

  const nextExercise = exerciseById(workout, rest?.next?.exerciseId);
  const catchUpExercise = exerciseById(workout, rest?.catchUpExerciseId);
  const doneExercise = exerciseById(workout, rest?.completedExerciseId);
  const canCatchUp =
    !!catchUpExercise &&
    !!workoutId &&
    status === "running" &&
    catchUpExercise.sets.length < targetSetCount(catchUpExercise);

  const nextSetLabel =
    rest?.next && nextExercise
      ? `Set ${rest.next.setNumber} of ${targetSetCount(nextExercise)}`
      : null;

  const leave = useCallback(
    (target: string) => {
      if (leaving.current) return;
      leaving.current = true;
      clearRest();
      router.replace(target);
    },
    [clearRest, router],
  );

  // Rest is always cleared before navigating away, so this only fires when a
  // rest genuinely went missing — a stale link or cleared storage.
  useEffect(() => {
    if (!hydrated || leaving.current) return;
    if (!rest) router.replace("/workout");
  }, [hydrated, rest, router]);

  // The clock ticks once a second while running; landing on zero ends the rest.
  useEffect(() => {
    if (!hydrated || !rest || leaving.current) return;
    if (status !== "running") return;
    if (restRemainingMs !== null && restRemainingMs > 0) return;
    leave(destination(rest.next?.exerciseId));
  }, [hydrated, rest, status, restRemainingMs, leave]);

  if (!hydrated || !rest) {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 size={18} className="animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading rest</p>
      </div>
    );
  }

  const paused = status === "paused";
  const restIsOver = rest.next === null;
  const remainingRatio = Math.min(Math.max(1 - restProgress, 0), 1);
  const totalMs = rest.durationSeconds * 1000;

  const handleBack = () => {
    if (status === "running") pause();
    leave("/workout");
  };

  // Undo a mis-tapped "Done": the exercise becomes pending again and the rest
  // is abandoned, so the user lands back on it.
  const handleUndoDone = () => {
    if (!doneExercise) return;
    uncompleteExercise(doneExercise.id);
    leave(`/exercise?exerciseId=${doneExercise.id}`);
  };

  const handleCatchUp = (data: WorkoutSetInput) => {
    if (!catchUpExercise || !workoutId) return;
    logSet.mutate(
      { workoutId, exerciseId: catchUpExercise.id, data },
      {
        onSuccess: () => {
          setLogOpen(false);
          logSet.reset();
        },
      },
    );
  };

  const handleDeleteSet = (setId: string) => {
    if (!catchUpExercise || !workoutId) return;
    deleteSet.mutate({
      workoutId,
      exerciseId: catchUpExercise.id,
      setId,
    });
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 min-h-dvh flex flex-col px-6 pt-14 pb-8">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl active:bg-secondary cursor-pointer"
            aria-label="Leave session"
          >
            <ArrowLeft size={22} />
          </motion.button>
          <div className="flex items-center gap-2">
            <SessionClock />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 py-1 rounded-md bg-secondary">
              Rest
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                strokeWidth={RING_STROKE}
                className="stroke-secondary"
              />
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - remainingRatio)}
                className="stroke-primary"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {paused ? "Paused" : restIsOver ? "Done" : "Rest"}
              </p>
              <p className="mt-1 text-5xl font-display font-bold tabular-nums">
                {formatCountdown(restRemainingMs ?? 0)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground tabular-nums">
                of {formatSessionTime(totalMs)}
              </p>
            </div>
          </div>

          <div className="w-full rounded-3xl bg-card border border-border p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Next up
            </p>

            {workoutLoading && !nextExercise ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : nextExercise && rest.next ? (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-secondary">
                  {MUSCLE_GROUP_EMOJI[nextExercise.primaryMuscle] ?? "🏋️"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-foreground truncate">
                    {nextExercise.exerciseName}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {nextSetLabel} ·{" "}
                    {MUSCLE_GROUP_NAMES[nextExercise.primaryMuscle] ??
                      nextExercise.primaryMuscle}
                  </p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/15">
                  <Dumbbell size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold">Workout complete</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Nothing left on the list
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-3">
            {doneExercise && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUndoDone}
                aria-label={`Undo marking ${doneExercise.exerciseName} done`}
                className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Undo2 size={16} className="text-primary shrink-0" />
                  <span className="truncate">{doneExercise.exerciseName} marked done</span>
                </span>
                <span className="text-primary shrink-0">Undo</span>
              </motion.button>
            )}

            {canCatchUp && catchUpExercise && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setLogOpen(true)}
                className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-semibold cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  Forgot a set?
                </span>
                <span className="text-[11px] font-normal text-muted-foreground truncate max-w-[50%]">
                  {catchUpExercise.exerciseName}
                </span>
              </motion.button>
            )}

            {paused ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={resume}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold glow-primary-intense cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                Resume workout
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => leave(destination(rest.next?.exerciseId))}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold glow-primary-intense cursor-pointer"
              >
                <SkipForward size={18} />
                {restIsOver ? "See summary" : "Skip rest"}
              </motion.button>
            )}

            <p className="text-center text-[11px] text-muted-foreground tabular-nums">
              Workout time {formatSessionTime(elapsedMs)}
            </p>
          </div>
        </div>
      </div>

      <LogSetSheet
        open={logOpen}
        onOpenChange={(open) => {
          if (!open) {
            setLogOpen(false);
            logSet.reset();
            deleteSet.reset();
          }
        }}
        exercise={catchUpExercise}
        onSubmit={handleCatchUp}
        onDeleteSet={handleDeleteSet}
        saving={logSet.isLoading}
        error={logSet.error ?? deleteSet.error}
      />
    </div>
  );
}
