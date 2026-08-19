"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, ChevronRight, Loader2, RotateCcw } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

import type { AlternateMuscle, MuscleGroup, Workout } from "@/types/workout";
import { useAlternateMuscles, useSwapWorkout } from "@/hooks/workout";
import { MUSCLE_GROUP_NAMES, MUSCLE_GROUP_EMOJI } from "../_lib/workout-sections";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMuscle?: MuscleGroup | string | null;
  onSwapped?: (newWorkout: Workout) => void;
};

export default function SwapMuscleSheet({
  open,
  onOpenChange,
  currentMuscle,
  onSwapped,
}: Props) {
  const [activeMuscle, setActiveMuscle] = useState<MuscleGroup | string | null>(
    currentMuscle ?? null,
  );

  useEffect(() => {
    if (open && currentMuscle) {
      setActiveMuscle(currentMuscle);
    }
  }, [open, currentMuscle]);

  const {
    mutateAsync: swapWorkout,
    isLoading: isSwapping,
    error: swapError,
    reset: resetSwap,
  } = useSwapWorkout();

  const { data, isLoading, error, refetch } = useAlternateMuscles(
    activeMuscle,
    open && !isSwapping && !!activeMuscle,
  );

  const [swappingMuscle, setSwappingMuscle] = useState<MuscleGroup | string | null>(null);

  const handleSelect = async (alternate: AlternateMuscle) => {
    if (isSwapping) return;
    setSwappingMuscle(alternate.muscle);
    try {
      const newWorkout = await swapWorkout(alternate.muscle);
      onSwapped?.(newWorkout);
      onOpenChange(false);
    } catch {
      // Error handled by mutation error state
    } finally {
      setSwappingMuscle(null);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetSwap();
      setSwappingMuscle(null);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-background max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-display">Swap today&apos;s workout</SheetTitle>
          <SheetDescription>
            Pick a different session for today. Your plan for the rest of the week stays the same.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-2.5 pb-4">
          {swapError && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              <AlertTriangle size={14} className="shrink-0" />
              <span className="flex-1">{swapError}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border"
                >
                  <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground text-xs">
                <Loader2 size={14} className="animate-spin text-primary" />
                Loading alternate muscles...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-card border border-destructive/30 my-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
                <AlertTriangle size={18} />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Couldn&apos;t load alternate muscles
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => refetch()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
              >
                <RotateCcw size={14} /> Retry
              </motion.button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No alternate workout options available for today.
            </div>
          ) : (
            data.map((alt) => {
              const emoji = MUSCLE_GROUP_EMOJI[alt.muscle] ?? "🏋️";
              const targetList = alt.targetMuscles
                .map((m) => MUSCLE_GROUP_NAMES[m] ?? m)
                .join(" · ");
              const isItemSwapping = swappingMuscle === alt.muscle;

              return (
                <motion.button
                  key={`${alt.splitDayIndex}-${alt.muscle}`}
                  whileTap={isSwapping ? undefined : { scale: 0.98 }}
                  onClick={() => handleSelect(alt)}
                  disabled={isSwapping}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border text-left transition-colors group ${
                    isSwapping
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer active:bg-secondary"
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {alt.name}
                      </p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground shrink-0">
                        Day {alt.splitDayIndex + 1}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {targetList}
                    </p>
                  </div>
                  {isItemSwapping ? (
                    <Loader2
                      size={16}
                      className="animate-spin text-primary shrink-0"
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
                    />
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
