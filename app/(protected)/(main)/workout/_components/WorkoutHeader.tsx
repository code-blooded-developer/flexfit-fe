"use client";

import { motion } from "motion/react";
import { ArrowLeft, Clock, Dumbbell, Repeat } from "lucide-react";
import { useRouter } from "next/navigation";

import type { MuscleGroup } from "@/types/workout";
import { MUSCLE_GROUP_NAMES } from "../_lib/workout-sections";

type Props = {
  targetMuscle?: MuscleGroup | string | null;
  durationMinutes: number | null;
  onSwap?: () => void;
};

export default function WorkoutHeader({
  targetMuscle,
  durationMinutes,
  onSwap,
}: Props) {
  const router = useRouter();
  const muscleName = targetMuscle
    ? (MUSCLE_GROUP_NAMES[targetMuscle as MuscleGroup] ?? targetMuscle)
    : "-";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 bg-background px-6 pt-8 pb-4 flex items-center gap-4"
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/dashboard")}
        className="p-2 -ml-2 rounded-xl active:bg-secondary cursor-pointer"
        aria-label="Back to dashboard"
      >
        <ArrowLeft size={22} className="text-foreground" />
      </motion.button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold font-display text-foreground truncate">
          Today&apos;s Session
        </h1>
        <div className="flex items-center gap-3 text-muted-foreground text-xs mt-0.5">
          <span className="flex items-center gap-1">
            <Dumbbell size={12} /> {muscleName}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} /> {durationMinutes ?? "-"} min
          </span>
        </div>
      </div>

      {onSwap && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onSwap}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold shrink-0 cursor-pointer active:bg-secondary/70 transition-colors"
        >
          <Repeat size={14} />
          Swap
        </motion.button>
      )}
    </motion.div>
  );
}

