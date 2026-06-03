"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import type { SectionKey, LibraryItem } from "../_lib/workout-sections";
import { workoutExerciseToLibraryItem, SECTION_TO_PHASE } from "../_lib/workout-sections";
import type { ExerciseCategory } from "@/types/workout";
import { useAlternatives } from "@/hooks/workout";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string | null;
  replacing: { section: SectionKey; id: string } | null;
  onSelect: (section: SectionKey, id: string, replacement: LibraryItem) => void;
};

export default function ReplaceExerciseSheet({ open, onOpenChange, workoutId, replacing, onSelect }: Props) {
  const phase: ExerciseCategory | null = replacing ? (SECTION_TO_PHASE[replacing.section] as ExerciseCategory) : null;
  const { data, isLoading, error } = useAlternatives(workoutId, phase);

  const items = useMemo(
    () => (data ?? []).map(workoutExerciseToLibraryItem),
    [data],
  );

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border bg-background max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display">Replace exercise</SheetTitle>
          <SheetDescription>Pick a replacement from the library.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading alternatives...
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-4">{error.message ?? "Failed to load alternatives"}</p>
          ) : (
            items.map((lib) => (
              <motion.button
                key={lib.name}
                whileTap={{ scale: 0.98 }}
                onClick={() => replacing && onSelect(replacing.section, replacing.id, lib)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border text-left active:bg-secondary"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lib.gradient} flex items-center justify-center text-2xl shrink-0`}
                >
                  {lib.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{lib.name}</p>
                  <p className="text-[11px] text-primary mt-0.5">{lib.muscle}</p>
                </div>
                <Check size={16} className="text-muted-foreground shrink-0" />
              </motion.button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
