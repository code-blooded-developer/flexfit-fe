"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Loader2,
  RefreshCw,
  SkipForward,
  Timer,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useWorkout } from "@/hooks/workout";
import { useWorkoutStore } from "@/store/workoutStore";
import { exerciseVideoUrl } from "@/lib/exerciseMedia";
import { resolveCues, shouldRotate } from "@/lib/instructions";
import {
  MUSCLE_GROUP_EMOJI,
  MUSCLE_GROUP_NAMES,
  pickGradient,
} from "@/app/(protected)/(main)/workout/_lib/workout-sections";
import type { WorkoutExercise } from "@/types/workout";

/** Which body parts on the skeleton to highlight for a given muscle name. */
const muscleMap: Record<string, string[]> = {
  chest: ["chest"],
  "upper chest": ["chest"],
  back: ["back"],
  shoulders: ["shoulders"],
  delts: ["shoulders"],
  triceps: ["triceps"],
  biceps: ["biceps"],
  arms: ["biceps", "triceps"],
  legs: ["quads", "hamstrings"],
  quads: ["quads"],
  hamstrings: ["hamstrings"],
  glutes: ["glutes"],
  calves: ["calves"],
  core: ["core"],
  abs: ["core"],
  cardio: ["core", "quads"],
  "full body": ["chest", "core", "quads", "shoulders"],
  spine: ["back"],
};

const getHighlights = (muscle?: string) => {
  if (!muscle) return [];
  return muscleMap[muscle.toLowerCase()] ?? [];
};

const OVERLAY_VISIBLE_MS = 4500;
const REST_SECONDS = 60;

const formatClock = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;

/* ── Body skeleton ── */

const BodySkeleton = ({ highlighted }: { highlighted: string[] }) => {
  const isOn = (k: string) => highlighted.includes(k);
  const active = "hsl(var(--primary))";
  const idle = "hsl(var(--muted))";
  const stroke = "hsl(var(--border))";

  return (
    <svg viewBox="0 0 120 200" className="w-full h-full" aria-hidden="true">
      {/* head */}
      <circle cx="60" cy="18" r="11" fill={idle} stroke={stroke} strokeWidth="1" />
      {/* neck */}
      <rect x="56" y="28" width="8" height="6" fill={idle} />
      {/* shoulders */}
      <path
        d="M30 40 Q60 30 90 40 L88 52 Q60 44 32 52 Z"
        fill={isOn("shoulders") ? active : idle}
        stroke={stroke}
      />
      {/* chest */}
      <path
        d="M36 50 Q60 56 84 50 L82 76 Q60 82 38 76 Z"
        fill={isOn("chest") ? active : idle}
        stroke={stroke}
      />
      {/* core */}
      <path
        d="M40 76 L80 76 L76 104 L44 104 Z"
        fill={isOn("core") ? active : idle}
        stroke={stroke}
      />
      {/* back (shown subtly behind via dashed outline) */}
      {isOn("back") && (
        <path
          d="M38 52 L82 52 L80 100 L40 100 Z"
          fill="none"
          stroke={active}
          strokeWidth="2"
          strokeDasharray="3 3"
        />
      )}
      {/* biceps (upper arms) */}
      <rect x="20" y="50" width="10" height="28" rx="5" fill={isOn("biceps") ? active : idle} stroke={stroke} />
      <rect x="90" y="50" width="10" height="28" rx="5" fill={isOn("biceps") ? active : idle} stroke={stroke} />
      {/* triceps (lower arms) */}
      <rect x="20" y="80" width="10" height="26" rx="5" fill={isOn("triceps") ? active : idle} stroke={stroke} />
      <rect x="90" y="80" width="10" height="26" rx="5" fill={isOn("triceps") ? active : idle} stroke={stroke} />
      {/* hands */}
      <circle cx="25" cy="112" r="5" fill={idle} stroke={stroke} />
      <circle cx="95" cy="112" r="5" fill={idle} stroke={stroke} />
      {/* quads */}
      <rect x="42" y="106" width="14" height="42" rx="6" fill={isOn("quads") ? active : idle} stroke={stroke} />
      <rect x="64" y="106" width="14" height="42" rx="6" fill={isOn("quads") ? active : idle} stroke={stroke} />
      {/* hamstrings overlay */}
      {isOn("hamstrings") && (
        <>
          <rect x="42" y="106" width="14" height="42" rx="6" fill="none" stroke={active} strokeWidth="2" strokeDasharray="3 3" />
          <rect x="64" y="106" width="14" height="42" rx="6" fill="none" stroke={active} strokeWidth="2" strokeDasharray="3 3" />
        </>
      )}
      {/* glutes */}
      {isOn("glutes") && <ellipse cx="60" cy="108" rx="22" ry="6" fill={active} opacity="0.7" />}
      {/* calves */}
      <rect x="44" y="150" width="11" height="32" rx="5" fill={isOn("calves") ? active : idle} stroke={stroke} />
      <rect x="65" y="150" width="11" height="32" rx="5" fill={isOn("calves") ? active : idle} stroke={stroke} />
      {/* feet */}
      <ellipse cx="49" cy="186" rx="7" ry="4" fill={idle} stroke={stroke} />
      <ellipse cx="70" cy="186" rx="7" ry="4" fill={idle} stroke={stroke} />
    </svg>
  );
};

/* ── Page ── */

type Props = {
  exerciseId: string | null;
};

export default function ExerciseFocus({ exerciseId }: Props) {
  const router = useRouter();

  // Hydrates the store when the page is opened directly (refresh / deep link).
  const { isError } = useWorkout();
  const todayWorkout = useWorkoutStore((s) => s.todayWorkout);
  const isLoading = useWorkoutStore((s) => s.isLoading);
  const storeError = useWorkoutStore((s) => s.error);

  const workoutExercise: WorkoutExercise | null = useMemo(() => {
    if (!exerciseId || !todayWorkout) return null;
    return todayWorkout.exercises.find((ex) => ex.id === exerciseId) ?? null;
  }, [exerciseId, todayWorkout]);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/workout");
  }, [router]);

  const showSkeleton = isLoading && !workoutExercise;
  const loadFailed = (isError || storeError) && !workoutExercise;

  if (showSkeleton) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <div className="px-6 pt-14 pb-4 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="px-6 mt-2">
          <Skeleton className="h-24 w-full max-w-xs rounded-2xl" />
        </div>
        <div className="flex-1" />
        <div className="px-6 pb-8 flex flex-col gap-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
            <Loader2 size={14} className="animate-spin text-primary" />
            Loading exercise
          </div>
        </div>
      </div>
    );
  }

  if (loadFailed || !workoutExercise) {
    return (
      <div className="min-h-dvh bg-background px-6 pt-14">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="p-2 -ml-2 rounded-xl active:bg-secondary cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={22} className="text-foreground" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-3xl bg-card p-6 border border-border"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">
            {loadFailed ? "Couldn't load exercise" : "Exercise not found"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loadFailed
              ? (storeError ?? "Something went wrong while loading your workout.")
              : "This exercise isn't part of today's workout."}
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/workout")}
            className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm cursor-pointer"
          >
            Back to workout
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <ExerciseFocusView
      key={workoutExercise.id}
      exercise={workoutExercise}
      onExit={handleBack}
    />
  );
}

/* ── Focus view ── */

function ExerciseFocusView({
  exercise,
  onExit,
}: {
  exercise: WorkoutExercise;
  onExit: () => void;
}) {
  const name = exercise.exerciseName;
  const muscle = MUSCLE_GROUP_NAMES[exercise.primaryMuscle] ?? exercise.primaryMuscle;
  const image = MUSCLE_GROUP_EMOJI[exercise.primaryMuscle] ?? "🏋️";
  const gradient = pickGradient(exercise.exerciseName);
  const totalSets = Math.max(exercise.targetSets ?? exercise.sets.length ?? 0, 1);

  const lastSet = exercise.sets[exercise.sets.length - 1];
  const weightLabel = lastSet?.weight != null ? `${lastSet.weight} kg` : "—";
  const targetLabel = exercise.targetReps
    ? `${exercise.targetReps} reps`
    : exercise.targetDurationSeconds != null
      ? formatClock(exercise.targetDurationSeconds)
      : "—";

  // Local only: sets are not persisted yet.
  const [localSets, setLocalSets] = useState(0);
  const loggedSets = exercise.sets.length + localSets;
  const currentSet = Math.min(loggedSets + 1, totalSets);
  const allSetsDone = loggedSets >= totalSets;

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [restTime, setRestTime] = useState(REST_SECONDS);
  const [restActive, setRestActive] = useState(false);
  const [instructionIdx, setInstructionIdx] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);

  const resting = restActive && restTime > 0;

  const videoUrl = useMemo(
    () => exerciseVideoUrl(exercise.exerciseId, exercise.videoKey),
    [exercise.exerciseId, exercise.videoKey],
  );

  const highlights = useMemo(() => getHighlights(muscle.toLowerCase()), [muscle]);

  // Cues come from the backend, one per line — no client-side guessing.
  const cues = useMemo(
    () => resolveCues(exercise.instructions, exercise.phase),
    [exercise.instructions, exercise.phase],
  );
  const rotating = shouldRotate(cues);
  const activeCue = cues[instructionIdx % cues.length];

  const hideTimer = useRef<number | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOverlayVisible(false), OVERLAY_VISIBLE_MS);
  }, []);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [scheduleHide]);

  const handleTap = useCallback(() => {
    setOverlayVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  // Cycle cues while the controls are hidden — only worth doing with 2+.
  useEffect(() => {
    if (overlayVisible || !rotating) return;
    const id = window.setInterval(() => {
      setInstructionIdx((i) => (i + 1) % cues.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [overlayVisible, rotating, cues.length]);

  // Rest timer — one interval while resting, cleaned up when it reaches zero.
  useEffect(() => {
    if (!resting) return;
    const id = window.setInterval(() => {
      setRestTime((t) => Math.max(t - 1, 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resting]);

  const handleLog = () => {
    if (allSetsDone) {
      onExit();
      return;
    }
    // TODO: persist with POST /workouts/{workoutId}/exercises/{id}/sets once set logging lands.
    setLocalSets((n) => n + 1);
    setRestActive(true);
    setRestTime(REST_SECONDS);
    setOverlayVisible(true);
    scheduleHide();
  };

  const skipRest = () => {
    setRestActive(false);
    setRestTime(REST_SECONDS);
  };

  // While idle the card shows the upcoming rest, not a stale 0:00.
  const displayRestTime = resting ? restTime : REST_SECONDS;

  return (
    <div
      className="relative min-h-dvh overflow-hidden bg-background text-foreground"
      onClick={handleTap}
    >
      {/* Background video */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      {videoUrl && !videoFailed ? (
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-[18rem] leading-none select-none drop-shadow-2xl">{image}</span>
        </motion.div>
      )}
      {/* Soft vignette for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/10 to-background/90" />

      {/* Cycling instructions (visible when overlay hidden) */}
      <AnimatePresence>
        {!overlayVisible && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-24 px-8 flex flex-col items-center text-center z-10 pointer-events-none"
          >
            {rotating && (
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary mb-3">
                Cue {(instructionIdx % cues.length) + 1} of {cues.length}
              </p>
            )}
            <AnimatePresence mode="wait">
              <motion.p
                key={instructionIdx % cues.length}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-xl font-display font-semibold text-foreground max-w-md"
              >
                {activeCue}
              </motion.p>
            </AnimatePresence>
            <p className="mt-6 text-[11px] text-muted-foreground">Tap anywhere to show controls</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {overlayVisible && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-20 flex flex-col"
            onClick={(e) => {
              // Buttons handle their own clicks; don't bubble up to the root tap-to-show.
              e.stopPropagation();
              scheduleHide();
            }}
          >
            {/* Top bar */}
            <div className="flex items-start justify-between px-6 pt-14 pb-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onExit}
                className="p-2 -ml-2 rounded-xl bg-background/60 backdrop-blur-md cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft size={22} />
              </motion.button>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold px-2 py-1 rounded-md bg-primary/15">
                  Set {currentSet} of {totalSets}
                </span>
                <span className="text-[11px] text-muted-foreground">{muscle}</span>
              </div>
            </div>

            {/* Muscle skeleton card */}
            <div className="px-6">
              <div className="rounded-2xl bg-background/60 backdrop-blur-md border border-border p-3 flex items-center gap-3 max-w-xs">
                <div className="w-16 h-20 shrink-0">
                  <BodySkeleton highlighted={highlights} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Targets</p>
                  <p className="text-sm font-semibold capitalize">
                    {highlights.length ? highlights.join(" · ") : muscle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Bottom block: name, reps, actions, rest */}
            <div className="px-6 pb-8 flex flex-col gap-5">
              <div>
                <h1 className="font-display text-3xl font-bold leading-tight">{name}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{targetLabel}</strong>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>
                    <strong className="text-foreground">{weightLabel}</strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLog}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold glow-primary-intense cursor-pointer"
                >
                  <Check size={18} />
                  {allSetsDone ? "Finish" : "Log set"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onExit}
                  className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-background/70 backdrop-blur-md border border-border text-foreground font-semibold text-sm cursor-pointer"
                >
                  <RefreshCw size={16} />
                  Replace
                </motion.button>
              </div>

              {/* Rest timer */}
              <div className="rounded-2xl bg-background/70 backdrop-blur-md border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Timer size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {resting ? "Resting" : "Next rest"}
                  </p>
                  <motion.p
                    key={displayRestTime}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    className="text-xl font-bold font-display"
                  >
                    {formatClock(displayRestTime)}
                  </motion.p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={skipRest}
                  disabled={!resting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <SkipForward size={14} />
                  Skip
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
