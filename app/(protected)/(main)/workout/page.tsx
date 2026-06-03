"use client";

import { useState } from "react";

import { useWorkout } from "@/hooks/useWorkout";
import { useWorkoutStore } from "@/store/workoutStore";
import {
  mapWorkoutToSections,
  pickGradient,
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

const uid = () => Math.random().toString(36).slice(2, 10);

export default function WorkoutPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [addingTo, setAddingTo] = useState<SectionKey | null>(null);
  const [replacing, setReplacing] = useState<{ section: SectionKey; id: string } | null>(null);
  const [logging, setLogging] = useState<{ section: SectionKey; exercise: Exercise } | null>(null);

  useWorkout();
  const { todayWorkout, isLoading, error } = useWorkoutStore();
  const [workoutId, setWorkoutId] = useState<string | null>(null);

  if (todayWorkout && todayWorkout.id !== workoutId) {
    setWorkoutId(todayWorkout.id);
    setSections(mapWorkoutToSections(todayWorkout));
  }

  const updateSection = (key: SectionKey, fn: (exs: Exercise[]) => Exercise[]) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, exercises: fn(s.exercises) } : s)));

  const handleAdd = (sk: SectionKey) => setAddingTo(sk);

  const handleAddSubmit = (data: { name: string; muscle: string; type: "strength" | "cardio" | "mobility"; emoji: string }) => {
    if (!addingTo) return;
    const ex: Exercise = {
      id: uid(),
      name: data.name,
      muscle: data.muscle,
      image: data.emoji,
      gradient: pickGradient(data.name),
      type: data.type,
      logs: [],
    };
    updateSection(addingTo, (exs) => [...exs, ex]);
  };

  const handleReplace = (sk: SectionKey, id: string) => setReplacing({ section: sk, id });

  const handleReplaceSelect = (sk: SectionKey, id: string, replacement: LibraryItem) => {
    updateSection(sk, (exs) =>
      exs.map((e) => (e.id === id ? { ...replacement, id, logs: e.logs } : e)),
    );
    setReplacing(null);
  };

  const handleDelete = (sk: SectionKey, id: string) => {
    updateSection(sk, (exs) => exs.filter((e) => e.id !== id));
  };

  const handleLog = (sk: SectionKey, exercise: Exercise) => setLogging({ section: sk, exercise });

  const handleLogSubmit = (sk: SectionKey, exerciseId: string, data: { weight?: string; reps?: string; time?: string; distance?: string; notes?: string }) => {
    updateSection(sk, (exs) =>
      exs.map((e) =>
        e.id === exerciseId
          ? { ...e, logs: [{ id: uid(), ...data, createdAt: Date.now() }, ...e.logs] }
          : e,
      ),
    );
  };

  const handleDeleteLog = (sk: SectionKey, exerciseId: string, logId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.key === sk
          ? { ...s, exercises: s.exercises.map((e) => (e.id === exerciseId ? { ...e, logs: e.logs.filter((l) => l.id !== logId) } : e)) }
          : s,
      ),
    );
    setLogging((cur) =>
      cur
        ? { ...cur, exercise: { ...cur.exercise, logs: cur.exercise.logs.filter((l) => l.id !== logId) } }
        : cur,
    );
  };

  const totalExercises = sections.reduce((a, s) => a + s.exercises.length, 0);

  if (isLoading) {
    return (
      <div className="px-6 pt-14 pb-4 animate-pulse">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-14 pb-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!todayWorkout) {
    return (
      <div className="px-6 pt-14 pb-4">
        <p className="text-sm text-muted-foreground">No workout found for today.</p>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <WorkoutHeader exerciseCount={totalExercises} durationMinutes={todayWorkout.totalDurationMinutes} />

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
        onOpenChange={(o) => { if (!o) setAddingTo(null); }}
        sectionKey={addingTo}
        sectionTitle={sections.find((s) => s.key === addingTo)?.title ?? ""}
        onSubmit={handleAddSubmit}
      />

      <ReplaceExerciseSheet
        open={!!replacing}
        onOpenChange={(o) => { if (!o) setReplacing(null); }}
        replacing={replacing}
        onSelect={handleReplaceSelect}
      />

      <LogSetSheet
        open={!!logging}
        onOpenChange={(o) => { if (!o) setLogging(null); }}
        logging={logging}
        onSubmit={handleLogSubmit}
        onDeleteLog={handleDeleteLog}
      />
    </div>
  );
}
