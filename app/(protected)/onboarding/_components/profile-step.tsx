"use client";

import { motion, AnimatePresence } from "motion/react";

import { ChevronRight, Loader2, AlertCircle } from "lucide-react";

import type { Gender, HeightUnit, WeightUnit } from "@/types/auth";

import type { ProfileErrors } from "../_lib/validation";

const ErrorMsg = ({ msg }: { msg?: string | null }) => (
  <AnimatePresence>
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: -4, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        transition={{ duration: 0.18 }}
        className="flex items-center gap-1.5 px-1 text-xs text-destructive mt-1"
      >
        <AlertCircle size={12} />
        <span>{msg}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

const UnitToggle = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) => (
  <div className="flex gap-1 p-1 rounded-xl bg-secondary">
    {options.map((o) => (
      <button
        key={o}
        type="button"
        onClick={() => onChange(o)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          value === o
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

type Props = {
  height: string;
  weight: string;
  gender: Gender | "";
  heightUnit: HeightUnit;
  weightUnit: WeightUnit;
  dateOfBirth: string;
  errors: ProfileErrors;
  onHeightChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onHeightUnitChange: (value: HeightUnit) => void;
  onWeightUnitChange: (value: WeightUnit) => void;
  onDateOfBirthChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
};

export function ProfileStep({
  height,
  weight,
  gender,
  heightUnit,
  weightUnit,
  dateOfBirth,
  errors,
  onHeightChange,
  onWeightChange,
  onGenderChange,
  onHeightUnitChange,
  onWeightUnitChange,
  onDateOfBirthChange,
  onSubmit,
  loading,
  error,
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Height</label>
            <UnitToggle
              value={heightUnit}
              options={["CM", "FT"] as const}
              onChange={onHeightUnitChange}
            />
          </div>

          <input
            type="number"
            value={height}
            onChange={(e) => onHeightChange(e.target.value)}
            placeholder={heightUnit === "CM" ? "175" : "5.9"}
            className={`w-full p-4 rounded-2xl bg-card border-2 text-foreground text-lg outline-none transition-all ${
              errors.height
                ? "border-destructive focus:border-destructive"
                : "border-transparent focus:border-primary"
            }`}
          />
          <ErrorMsg msg={errors.height} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Weight</label>
            <UnitToggle
              value={weightUnit}
              options={["KG", "LB"] as const}
              onChange={onWeightUnitChange}
            />
          </div>

          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder={weightUnit === "KG" ? "75" : "165"}
            className={`w-full p-4 rounded-2xl bg-card border-2 text-foreground text-lg outline-none transition-all ${
              errors.weight
                ? "border-destructive focus:border-destructive"
                : "border-transparent focus:border-primary"
            }`}
          />
          <ErrorMsg msg={errors.weight} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="text-sm text-muted-foreground mb-2 block">
            Date of Birth
          </label>

          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => onDateOfBirthChange(e.target.value)}
            className={`w-full p-4 rounded-2xl bg-card border-2 text-foreground text-lg outline-none transition-all focus:glow-primary [color-scheme:dark] ${
              errors.dateOfBirth
                ? "border-destructive focus:border-destructive"
                : "border-transparent focus:border-primary"
            }`}
          />
          <ErrorMsg msg={errors.dateOfBirth} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
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
                      : errors.gender
                        ? "bg-card border-2 border-destructive text-foreground"
                        : "bg-card border-2 border-transparent text-foreground"
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
          <ErrorMsg msg={errors.gender} />
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
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        onClick={onSubmit}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base mt-8 transition-all bg-primary text-primary-foreground glow-primary-intense disabled:opacity-70`}
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
