"use client";

import { motion, AnimatePresence } from "motion/react";

import { ChevronRight, Loader2, AlertCircle } from "lucide-react";

import type { Gender } from "@/types/auth";

type Props = {
  height: string;
  weight: string;
  gender: Gender | "";
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  canContinue: boolean;
};

export function ProfileStep({
  height,
  weight,
  gender,
  onHeightChange,
  onWeightChange,
  onGenderChange,
  onSubmit,
  loading,
  error,
  canContinue,
}: Props) {
  return (
    <>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold font-display text-foreground mb-1"
      >
        About you
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground text-sm mb-8"
      >
        Help us calibrate your workouts
      </motion.p>

      <div className="flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="text-sm text-muted-foreground mb-2 block">
            Height (cm)
          </label>

          <input
            type="number"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder="175"
            className="w-full p-4 rounded-2xl bg-card border-2 border-transparent focus:border-primary text-foreground text-lg outline-none transition-all"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <label className="text-sm text-muted-foreground mb-2 block">
            Weight (kg)
          </label>

          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="75"
            className="w-full p-4 rounded-2xl bg-card border-2 border-transparent focus:border-primary text-foreground text-lg outline-none transition-all"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm text-muted-foreground mb-2 block">
            Gender
          </label>

          <div className="flex gap-3">
            {[
              {
                label: "Male",
                value: "MALE",
              },
              {
                label: "Female",
                value: "FEMALE",
              },
              {
                label: "Other",
                value: "OTHER",
              },
            ].map((item) => {
              const isSelected = gender === item.value;

              return (
                <motion.button
                  key={item.value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onGenderChange(item.value as Gender)}
                  className={`flex-1 py-4 rounded-2xl font-semibold transition-all ${
                    isSelected
                      ? "bg-primary/15 border-2 border-primary text-primary"
                      : "bg-card border-2 border-transparent text-foreground"
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -4,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: -4,
              height: 0,
            }}
            className="flex items-center gap-2 text-destructive text-sm mt-4"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={canContinue && !loading ? { scale: 1.01 } : {}}
        whileTap={canContinue && !loading ? { scale: 0.98 } : {}}
        onClick={onSubmit}
        disabled={!canContinue || loading}
        className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base mt-8 transition-all ${
          canContinue
            ? "bg-primary text-primary-foreground glow-primary-intense"
            : "bg-secondary text-muted-foreground"
        } disabled:opacity-70`}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Start Training
            <motion.div
              animate={{
                x: [0, 4, 0],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
              }}
            >
              <ChevronRight size={18} />
            </motion.div>
          </>
        )}
      </motion.button>
    </>
  );
}
