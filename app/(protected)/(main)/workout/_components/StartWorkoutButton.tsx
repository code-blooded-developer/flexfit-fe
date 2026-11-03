"use client";

import { motion } from "motion/react";
import { Play, RotateCcw } from "lucide-react";

type Props = {
  onClick: () => void;
  label?: string;
  /** Secondary text inside the button, e.g. the elapsed clock. */
  hint?: string | null;
  icon?: "play" | "restart";
};

export default function StartWorkoutButton({
  onClick,
  label = "Start Workout",
  hint,
  icon = "play",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="fixed bottom-24 left-0 right-0 px-6 z-30"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base glow-primary-intense shadow-lg"
      >
        <motion.div
          animate={icon === "play" ? { x: [0, 3, 0] } : { rotate: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {icon === "play" ? (
            <Play size={18} fill="currentColor" />
          ) : (
            <RotateCcw size={18} />
          )}
        </motion.div>
        <span>{label}</span>
        {hint && (
          <span className="text-primary-foreground/70 text-sm font-medium tabular-nums">
            {hint}
          </span>
        )}
      </motion.button>
    </motion.div>
  );
}
