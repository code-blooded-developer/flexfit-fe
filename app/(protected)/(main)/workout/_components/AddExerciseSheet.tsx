"use client";

import { useState, useMemo } from "react";
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
import { workoutExerciseToLibraryItem, SECTION_TO_PHASE, MUSCLE_GROUP_NAMES } from "../_lib/workout-sections";
import type { ExerciseCategory, MuscleGroup } from "@/types/workout";
import { useAlternatives } from "@/hooks/workout";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutId: string | null;
  sectionKey: SectionKey | null;
  sectionTitle: string;
  onAdd: (sectionKey: SectionKey, items: LibraryItem[]) => void;
};

export default function AddExerciseSheet({ open, onOpenChange, workoutId, sectionKey, sectionTitle, onAdd }: Props) {
  const phase: ExerciseCategory | null = sectionKey ? (SECTION_TO_PHASE[sectionKey] as ExerciseCategory) : null;
  const { data, isLoading, error } = useAlternatives(workoutId, phase);

  const items = useMemo(
    () => (data ?? []).map(workoutExerciseToLibraryItem),
    [data],
  );

  const allMuscles = useMemo(() => {
    const set = new Set<MuscleGroup>();
    items.forEach((item) => set.add(item.primaryMuscle));
    return Array.from(set);
  }, [items]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMuscles, setActiveMuscles] = useState<Set<MuscleGroup>>(new Set());

  const filteredItems = useMemo(() => {
    if (activeMuscles.size === 0) return items;
    return items.filter((item) => activeMuscles.has(item.primaryMuscle));
  }, [items, activeMuscles]);

  const toggleMuscle = (m: MuscleGroup) => {
    setActiveMuscles((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
    setSelectedIds(new Set());
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (!sectionKey || selectedIds.size === 0) return;
    const selected = filteredItems.filter((item) => selectedIds.has(item.alternativeId));
    onAdd(sectionKey, selected);
    setSelectedIds(new Set());
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onOpenChange(false);
      setSelectedIds(new Set());
      setActiveMuscles(new Set());
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border bg-background max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display">Add to {sectionTitle}</SheetTitle>
          <SheetDescription>Select exercises to add from the library.</SheetDescription>
        </SheetHeader>

        {!isLoading && !error && items.length > 0 && (
          <div className="mt-4 flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
            <button
              onClick={() => { setActiveMuscles(new Set()); setSelectedIds(new Set()); }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none ${
                activeMuscles.size === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              All
            </button>
            {allMuscles.map((m) => {
              const active = activeMuscles.has(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleMuscle(m)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors focus-visible:outline-none ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {MUSCLE_GROUP_NAMES[m]}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" />
              Loading exercises...
            </div>
          ) : error ? (
            <p className="text-sm text-destructive text-center py-4">{error ?? "Failed to load exercises"}</p>
          ) : (
            filteredItems.map((lib) => {
              const checked = selectedIds.has(lib.alternativeId);
              return (
                <motion.button
                  key={lib.alternativeId}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggle(lib.alternativeId)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border text-left active:bg-secondary"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      checked
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {checked && <Check size={14} strokeWidth={3} />}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lib.gradient} flex items-center justify-center text-2xl shrink-0`}
                  >
                    {lib.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{lib.name}</p>
                    <p className="text-[11px] text-primary mt-0.5">{lib.muscle}</p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="sticky bottom-0 pb-4 pt-4 bg-background">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={selectedIds.size === 0}
              onClick={handleAdd}
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40"
            >
              Add {selectedIds.size > 0 ? `${selectedIds.size} exercise${selectedIds.size > 1 ? "s" : ""}` : "exercises"}
            </motion.button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
