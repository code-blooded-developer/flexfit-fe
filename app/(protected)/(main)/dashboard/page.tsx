"use client";

import { motion } from "motion/react";
import {
  Play,
  Clock,
  Dumbbell,
  TrendingUp,
  ChevronRight,
  Zap,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";

import AnimatedCounter from "../_components/AnimatedCounter";

import { useRouter } from "next/navigation";
import { useWorkout } from "@/hooks/workout";
import { useWorkoutStore } from "@/store/workoutStore";
import { MUSCLE_GROUP_LABELS } from "@/types/workout";
import { Skeleton } from "@/components/ui/skeleton";

const container = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const item = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  useWorkout();

  const { todayWorkout, isLoading, error } = useWorkoutStore();

  const workoutTitle = todayWorkout
    ? MUSCLE_GROUP_LABELS[todayWorkout.targetMuscle]
    : "";

  return (
    <>
      <motion.div variants={item} className="px-6 pt-14 pb-2 relative z-10">
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm"
        >
          Good morning
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold font-display text-foreground"
        >
          Let&apos;s Train 💪
        </motion.h1>
      </motion.div>

      {isLoading && (
        <div className="mx-6 mt-6 relative z-10 space-y-6">
          <div className="rounded-3xl bg-card p-6 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Loader2 size={14} className="text-primary animate-spin" />
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                Loading today&apos;s workout
              </span>
            </div>
            <Skeleton className="h-8 w-2/3 mt-2" />
            <div className="flex gap-3 mt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-14 w-full mt-6 rounded-2xl" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-6 relative z-10"
        >
          <div className="rounded-3xl bg-card p-6 border border-destructive/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Couldn&apos;t load today&apos;s workout
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <motion.button
              onClick={() => router.refresh()}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              <RotateCcw size={16} />
              Retry
            </motion.button>
          </div>
        </motion.div>
      )}

      {!isLoading && !error && todayWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mx-6 mt-6 relative z-10"
        >
          <div className="rounded-3xl bg-card p-6 border border-border breathe-glow shimmer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
            <motion.div
              className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(142 71% 45% / 0.08) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="flex items-center gap-2 mb-1 relative z-10">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Zap size={14} className="text-primary" />
              </motion.div>
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                Today&apos;s Workout
              </span>
            </div>

            <h2 className="text-2xl font-bold font-display text-foreground mt-2 relative z-10">
              {workoutTitle}
            </h2>
            <div className="flex items-center gap-4 mt-3 text-muted-foreground text-sm relative z-10">
              <span className="flex items-center gap-1.5">
                <Dumbbell size={14} />
                {todayWorkout.exercises.length} Exercises
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {todayWorkout.totalDurationMinutes ?? "-"} min
              </span>
            </div>
            <motion.button
              onClick={() => router.push("/workout")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full mt-6 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base relative z-10 glow-primary-intense"
            >
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Play size={18} fill="currentColor" />
              </motion.div>
              Start Workout
            </motion.button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-6 mt-8 relative z-10"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          This Week
        </h3>
        <motion.div
          className="grid grid-cols-3 gap-3"
          variants={container}
          initial="initial"
          animate="animate"
        >
          {[
            { label: "Workouts", value: 3, icon: Dumbbell, suffix: "" },
            { label: "Minutes", value: 135, icon: Clock, suffix: "" },
            { label: "Streak", value: 5, icon: TrendingUp, suffix: "🔥" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-card p-4 border border-border text-center gradient-border"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.6 + i * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <stat.icon size={16} className="text-primary mx-auto mb-2" />
              </motion.div>
              <p className="text-xl font-bold font-display text-foreground">
                <AnimatedCounter value={stat.value} />
                {stat.suffix}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 mt-8 relative z-10"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Previous Workout
        </h3>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/workout")}
          className="w-full rounded-2xl bg-card p-5 border border-border flex items-center justify-between transition-all"
        >
          <div>
            <p className="font-semibold text-foreground">Pull Day</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              5 exercises · 40 min
            </p>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronRight size={18} className="text-muted-foreground" />
          </motion.div>
        </motion.button>
      </motion.div>
    </>
  );
}
