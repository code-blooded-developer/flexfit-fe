"use client";

import { motion } from "motion/react";
import { Play } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function StartWorkoutButton({ onClick }: Props) {
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
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Play size={18} fill="currentColor" />
        </motion.div>
        Start Workout
      </motion.button>
    </motion.div>
  );
}
