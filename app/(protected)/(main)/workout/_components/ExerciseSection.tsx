"use client";

import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";

import type { Section, SectionKey, Exercise } from "../_lib/workout-sections";
import type { MuscleGroup } from "@/types/workout";
import ExerciseCard from "./ExerciseCard";

type Props = {
  section: Section;
  sectionKey: SectionKey;
  onAdd: (sectionKey: SectionKey) => void;
  onLog: (sectionKey: SectionKey, exercise: Exercise) => void;
  onReplace: (sectionKey: SectionKey, exerciseId: string, muscleGroup?: MuscleGroup) => void;
  onDelete: (sectionKey: SectionKey, exerciseId: string) => void;
};

export default function ExerciseSection({ section, sectionKey, onAdd, onLog, onReplace, onDelete }: Props) {
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Icon size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-foreground">{section.title}</h2>
            <p className="text-[11px] text-muted-foreground">{section.subtitle}</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{section.exercises.length}</span>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {section.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              sectionKey={sectionKey}
              onLog={onLog}
              onReplace={onReplace}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onAdd(sectionKey)}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-medium active:bg-secondary/50"
        >
          <Plus size={16} /> Add exercise
        </motion.button>
      </div>
    </motion.div>
  );
}
