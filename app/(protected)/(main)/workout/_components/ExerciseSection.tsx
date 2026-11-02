"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ChevronDown } from "lucide-react";

import type { Section, SectionKey, Exercise } from "../_lib/workout-sections";
import ExerciseCard from "./ExerciseCard";

type Props = {
  section: Section;
  sectionKey: SectionKey;
  defaultExpanded?: boolean;
  onAdd: (sectionKey: SectionKey) => void;
  onLog: (sectionKey: SectionKey, exercise: Exercise) => void;
  onReplace: (sectionKey: SectionKey, exerciseId: string) => void;
  onDelete: (sectionKey: SectionKey, exerciseId: string) => void;
};

export default function ExerciseSection({
  section,
  sectionKey,
  defaultExpanded = true,
  onAdd,
  onLog,
  onReplace,
  onDelete,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = section.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        aria-expanded={isExpanded}
        className="flex items-center justify-between mb-3 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Icon size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-foreground">{section.title}</h2>
            <p className="text-[11px] text-muted-foreground">{section.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{section.exercises.length}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <ChevronDown size={16} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden flex flex-col gap-3"
          >
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
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-primary/40 text-primary text-sm font-medium transition-colors active:bg-primary/10"
            >
              <Plus size={16} /> Add exercise
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
