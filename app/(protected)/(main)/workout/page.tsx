"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { useQueryClient } from "@tanstack/react-query";
import {
  useWorkout,
  useReplaceExercise,
  useDeleteExercise,
  useAddExercises,
  useLogSet,
  useDeleteSet,
} from "@/hooks/workout";
import { useWorkoutStore } from "@/store/workoutStore";
import { useSessionStore } from "@/store/sessionStore";
import { useSessionClock } from "@/hooks/useSession";
import { firstStep, formatSessionTime, orderedExercises } from "@/lib/session";
import type { WorkoutSetInput } from "@/types/workout";
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
import ReplaceExerciseSheet from "@/components/ReplaceExerciseSheet";
import LogSetSheet from "@/components/LogSetSheet";
import SwapMuscleSheet from "./_components/SwapMuscleSheet";
import StartWorkoutButton from "./_components/StartWorkoutButton";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<Section[]>([]);
  const [swapOpen, setSwapOpen] = useState(false);
  const [addingTo, setAddingTo] = useState<SectionKey | null>(null);
  const [replacing, setReplacing] = useState<{
    section: SectionKey;
    id: string;
  } | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  useWorkout();
  const { todayWorkout, isLoading, error } = useWorkoutStore();
  const replaceMutation = useReplaceExercise();
  const deleteMutation = useDeleteExercise();
  const addExercisesMutation = useAddExercises();
  const logSetMutation = useLogSet();
  const deleteSetMutation = useDeleteSet();

  /* ── Guided session ── */

  const hydrated = useSessionStore((s) => s.hydrated);
  const sessionStatus = useSessionStore((s) => s.status);
  const sessionWorkoutId = useSessionStore((s) => s.workoutId);
  const sessionDate = useSessionStore((s) => s.date);
  const skippedExerciseIds = useSessionStore((s) => s.skippedExerciseIds);
  const completedExerciseIds = useSessionStore((s) => s.completedExerciseIds);
  const startSession = useSessionStore((s) => s.start);
  const resumeSession = useSessionStore((s) => s.resume);
  const { elapsedMs } = useSessionClock();

  const matchesSession =
    !!todayWorkout &&
    hydrated &&
    sessionStatus !== "idle" &&
    sessionWorkoutId === todayWorkout.id &&
    sessionDate === todayWorkout.date;

  // Standing on the workout list means the session is paused; the clock must
  // not keep running just because the tab stayed open. Runs on arrival only,
  // so starting a session from this page isn't immediately undone.
  useEffect(() => {
    if (!hydrated) return;
    const session = useSessionStore.getState();
    if (session.status === "running") session.pause();
  }, [hydrated]);

  const handleStartWorkout = () => {
    if (!todayWorkout) return;

    // A session left over from another day is not resumable.
    const fresh = !matchesSession || sessionStatus === "completed";
    const step = firstStep(
      todayWorkout,
      fresh ? [] : [...skippedExerciseIds, ...completedExerciseIds],
    );
    const exerciseId =
      step?.exerciseId ?? orderedExercises(todayWorkout)[0]?.id ?? null;

    if (fresh) startSession(todayWorkout.id, todayWorkout.date);
    else resumeSession();

    if (exerciseId) router.push(`/exercise?exerciseId=${exerciseId}`);
  };

  const startLabel = matchesSession
    ? sessionStatus === "completed"
      ? "Start again"
      : "Resume workout"
    : "Start Workout";
  const startHint =
    matchesSession && sessionStatus !== "completed"
      ? formatSessionTime(elapsedMs)
      : null;

  const loggingExercise = useMemo(
    () =>
      loggingId
        ? (todayWorkout?.exercises.find((e) => e.id === loggingId) ?? null)
        : null,
    [loggingId, todayWorkout],
  );

  const [workoutKey, setWorkoutKey] = useState<string | null>(null);
  // Set counts belong in the key: logging a set changes no exercise ids, so
  // without them the refetched workout would never rebuild the sections.
  const nextKey = todayWorkout
    ? `${todayWorkout.id}-${todayWorkout.exercises
        .map((e) => `${e.id}:${e.sets.length}`)
        .join(",")}`
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

  const handleLog = (_sk: SectionKey, exercise: Exercise) =>
    setLoggingId(exercise.id);

  const handleLogSubmit = (data: WorkoutSetInput) => {
    if (!loggingId || !todayWorkout) return;
    logSetMutation.mutate(
      { workoutId: todayWorkout.id, exerciseId: loggingId, data },
      { onSuccess: () => setLoggingId(null) },
    );
  };

  const handleDeleteLog = (setId: string) => {
    if (!loggingId || !todayWorkout) return;
    deleteSetMutation.mutate({
      workoutId: todayWorkout.id,
      exerciseId: loggingId,
      setId,
    });
  };

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
        targetMuscle={todayWorkout.targetMuscle}
        durationMinutes={todayWorkout.totalDurationMinutes}
        onSwap={() => setSwapOpen(true)}
      />

      <SwapMuscleSheet
        open={swapOpen}
        onOpenChange={setSwapOpen}
        currentMuscle={todayWorkout.targetMuscle}
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

      {hydrated && (
        <StartWorkoutButton
          onClick={handleStartWorkout}
          label={startLabel}
          hint={startHint}
          icon={
            matchesSession && sessionStatus === "completed" ? "restart" : "play"
          }
        />
      )}

      <AddExerciseSheet
        open={!!addingTo}
        onOpenChange={(o) => {
          if (!o) setAddingTo(null);
        }}
        workoutId={todayWorkout?.id ?? null}
        muscle={todayWorkout?.targetMuscle ?? null}
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
        muscle={todayWorkout?.targetMuscle ?? null}
        replacing={replacing}
        onSelect={handleReplaceSelect}
        error={replaceMutation.error}
      />

      <LogSetSheet
        open={!!loggingId}
        onOpenChange={(open) => {
          if (!open) {
            setLoggingId(null);
            logSetMutation.reset();
            deleteSetMutation.reset();
          }
        }}
        exercise={loggingExercise}
        onSubmit={handleLogSubmit}
        onDeleteSet={handleDeleteLog}
        saving={logSetMutation.isLoading}
        error={logSetMutation.error ?? deleteSetMutation.error}
      />
    </div>
  );
}
