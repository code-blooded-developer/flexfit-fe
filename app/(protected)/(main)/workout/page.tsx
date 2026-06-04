"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { useQueryClient } from "@tanstack/react-query";
import {
  useWorkout,
  useReplaceExercise,
  useDeleteExercise,
  useAddExercises,
} from "@/hooks/workout";
import { useWorkoutStore } from "@/store/workoutStore";
import {
  mapWorkoutToSections,
  type Exercise,
  type LibraryItem,
  type Section,
  type SectionKey,
} from "./_lib/workout-sections";

import WorkoutHeader from "./_components/WorkoutHeader";
import ExerciseSection from "./_components/ExerciseSection";
import AddExerciseSheet from "./_components/AddExerciseSheet";
import ReplaceExerciseSheet from "./_components/ReplaceExerciseSheet";
import LogSetSheet from "./_components/LogSetSheet";
import StartWorkoutButton from "./_components/StartWorkoutButton";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const uid = () => Math.random().toString(36).slice(2, 10);

export default function WorkoutPage() {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [addingTo, setAddingTo] = useState<SectionKey | null>(null);
  const [replacing, setReplacing] = useState<{
    section: SectionKey;
    id: string;
  } | null>(null);
  const [logging, setLogging] = useState<{
    section: SectionKey;
    exercise: Exercise;
  } | null>(null);

  useWorkout();
  const { todayWorkout, isLoading, error } = useWorkoutStore();
  const replaceMutation = useReplaceExercise();
  const deleteMutation = useDeleteExercise();
  const addExercisesMutation = useAddExercises();

  const [workoutKey, setWorkoutKey] = useState<string | null>(null);
  const nextKey = todayWorkout
    ? `${todayWorkout.id}-${todayWorkout.exercises.map((e) => e.id).join(",")}`
    : null;
  if (nextKey && nextKey !== workoutKey) {
    setWorkoutKey(nextKey);
    setSections(mapWorkoutToSections(todayWorkout!));
  }

  const updateSection = (
    key: SectionKey,
    fn: (exs: Exercise[]) => Exercise[],
  ) =>
    setSections((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, exercises: fn(s.exercises) } : s,
      ),
    );

  const handleAdd = (sk: SectionKey) => setAddingTo(sk);

  const handleAddFromLibrary = (sk: SectionKey, items: LibraryItem[]) => {
    addExercisesMutation.mutate(
      {
        workoutId: todayWorkout!.id,
        exerciseIds: items.map((i) => i.alternativeId),
      },
      { onSuccess: () => setAddingTo(null) },
    );
  };

  const handleReplace = (sk: SectionKey, id: string) =>
    setReplacing({ section: sk, id });

  const handleReplaceSelect = (
    sk: SectionKey,
    id: string,
    replacement: LibraryItem,
  ) => {
    replaceMutation.mutate(
      {
        workoutId: todayWorkout!.id,
        exerciseId: id,
        alternativeId: replacement.alternativeId,
      },
      {
        onSuccess: () => {
          updateSection(sk, (exs) =>
            exs.map((e) =>
              e.id === id ? { ...replacement, id, logs: e.logs } : e,
            ),
          );
          setReplacing(null);
        },
      },
    );
  };

  const handleDelete = (sk: SectionKey, id: string) => {
    deleteMutation.mutate(
      { workoutId: todayWorkout!.id, exerciseId: id },
      {
        onSuccess: () => {
          updateSection(sk, (exs) => exs.filter((e) => e.id !== id));
        },
      },
    );
  };

  const handleLog = (sk: SectionKey, exercise: Exercise) =>
    setLogging({ section: sk, exercise });

  const handleLogSubmit = (
    sk: SectionKey,
    exerciseId: string,
    data: {
      weight?: string;
      reps?: string;
      time?: string;
      distance?: string;
      notes?: string;
    },
  ) => {
    updateSection(sk, (exs) =>
      exs.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              logs: [{ id: uid(), ...data, createdAt: Date.now() }, ...e.logs],
            }
          : e,
      ),
    );
  };

  const handleDeleteLog = (
    sk: SectionKey,
    exerciseId: string,
    logId: string,
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.key === sk
          ? {
              ...s,
              exercises: s.exercises.map((e) =>
                e.id === exerciseId
                  ? { ...e, logs: e.logs.filter((l) => l.id !== logId) }
                  : e,
              ),
            }
          : s,
      ),
    );
    setLogging((cur) =>
      cur
        ? {
            ...cur,
            exercise: {
              ...cur.exercise,
              logs: cur.exercise.logs.filter((l) => l.id !== logId),
            },
          }
        : cur,
    );
  };

  const totalExercises = sections.reduce((a, s) => a + s.exercises.length, 0);

  if (isLoading) {
    return (
      <div className="px-6 mt-2 flex flex-col gap-8">
        {["Warm Up", "Workout", "Stretch"].map((title, sIdx) => (
          <div key={title}>
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[0, 1, sIdx === 1 ? 2 : null]
                .filter((v) => v !== null)
                .map((i) => (
                  <Skeleton
                    key={i as number}
                    className="h-[76px] rounded-2xl"
                  />
                ))}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Loader2 size={14} className="animate-spin text-primary" />
          Loading workout
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-6"
      >
        <div className="rounded-3xl bg-card p-6 border border-destructive/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Couldn&apos;t load workout
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <motion.button
            onClick={() => {
              useWorkoutStore.getState().setLoading(true);
              useWorkoutStore.getState().setError(null);
              queryClient.resetQueries({ queryKey: ["todayWorkout"] });
            }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            <RotateCcw size={16} />
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!todayWorkout) {
    return (
      <div className="px-6 pt-14 pb-4">
        <p className="text-sm text-muted-foreground">
          No workout found for today.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <WorkoutHeader
        exerciseCount={totalExercises}
        durationMinutes={todayWorkout.totalDurationMinutes}
      />

      <div className="px-6 mt-2 flex flex-col gap-8">
        {sections.map((section) => (
          <ExerciseSection
            key={section.key}
            section={section}
            sectionKey={section.key}
            onAdd={handleAdd}
            onLog={handleLog}
            onReplace={handleReplace}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <StartWorkoutButton onClick={() => {}} />

      <AddExerciseSheet
        open={!!addingTo}
        onOpenChange={(o) => {
          if (!o) setAddingTo(null);
        }}
        workoutId={todayWorkout?.id ?? null}
        sectionKey={addingTo}
        sectionTitle={sections.find((s) => s.key === addingTo)?.title ?? ""}
        onAdd={handleAddFromLibrary}
      />

      <ReplaceExerciseSheet
        open={!!replacing}
        onOpenChange={(o) => {
          if (!o) setReplacing(null);
        }}
        workoutId={todayWorkout?.id ?? null}
        replacing={replacing}
        onSelect={handleReplaceSelect}
      />

      <LogSetSheet
        open={!!logging}
        onOpenChange={(o) => {
          if (!o) setLogging(null);
        }}
        logging={logging}
        onSubmit={handleLogSubmit}
        onDeleteLog={handleDeleteLog}
      />
    </div>
  );
}
