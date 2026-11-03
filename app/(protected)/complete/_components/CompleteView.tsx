"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, CheckCircle2, Dumbbell, Loader2, Timer } from "lucide-react";

import { useWorkout } from "@/hooks/workout";
import { useSessionStore } from "@/store/sessionStore";
import { useWorkoutStore } from "@/store/workoutStore";
import { formatSessionTime, targetSetCount } from "@/lib/session";

export default function CompleteView() {
  const router = useRouter();

  // Keeps the workout list warm for the stats below when opened directly.
  useWorkout();

  const hydrated = useSessionStore((s) => s.hydrated);
  const status = useSessionStore((s) => s.status);
  const accumulatedMs = useSessionStore((s) => s.accumulatedMs);
  const completedExerciseIds = useSessionStore((s) => s.completedExerciseIds);
  const clear = useSessionStore((s) => s.clear);

  const workout = useWorkoutStore((s) => s.todayWorkout);

  useEffect(() => {
    if (!hydrated) return;
    if (status !== "completed") router.replace("/workout");
  }, [hydrated, status, router]);

  if (!hydrated || status !== "completed") {
    return (
      <div className="min-h-dvh bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 size={18} className="animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Finishing up</p>
      </div>
    );
  }

  const loggedSets = workout
    ? workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)
    : null;
  const finishedExercises = workout
    ? workout.exercises.filter(
        (ex) =>
          ex.sets.length >= targetSetCount(ex) ||
          completedExerciseIds.includes(ex.id),
      ).length
    : null;

  const handleDone = () => {
    clear();
    router.replace("/workout");
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-background to-background" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full bg-primary/15 blur-3xl" />

      <div className="relative z-10 min-h-dvh flex flex-col items-center justify-center px-6 py-14">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="w-24 h-24 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center"
        >
          <CheckCircle2 size={46} className="text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 font-display text-3xl font-bold text-center"
        >
          Workout complete
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-2 text-sm text-muted-foreground text-center max-w-xs"
        >
          {workout
            ? `${workout.targetMuscle.charAt(0)}${workout.targetMuscle
                .slice(1)
                .toLowerCase()
                .replace("_", " ")} day in the books.`
            : "Session in the books."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-8 w-full rounded-3xl bg-card border border-border p-4 grid grid-cols-3 gap-2"
        >
          <Stat
            icon={<Timer size={14} className="text-primary" />}
            label="Time"
            value={formatSessionTime(accumulatedMs)}
          />
          <Stat
            icon={<Dumbbell size={14} className="text-primary" />}
            label="Sets"
            value={loggedSets === null ? "—" : String(loggedSets)}
          />
          <Stat
            icon={<Check size={14} className="text-primary" />}
            label="Exercises"
            value={finishedExercises === null ? "—" : String(finishedExercises)}
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDone}
          className="mt-8 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold glow-primary-intense cursor-pointer"
        >
          Done
        </motion.button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {icon}
      <p className="text-lg font-display font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
