"use client";

import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

type Props = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
};

export function OnboardingHeader({ currentStep, totalSteps, onBack }: Props) {
  return (
    <div className="flex items-center gap-3 mb-10 relative z-10">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.92 }}
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-foreground shrink-0"
        aria-label="Back"
      >
        <ArrowLeft size={18} />
      </motion.button>

      <div className="flex gap-1.5 flex-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className="h-1 flex-1 rounded-full overflow-hidden bg-secondary"
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={false}
              animate={{
                scaleX: index <= currentStep ? 1 : 0,
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
              style={{
                transformOrigin: "left",
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
