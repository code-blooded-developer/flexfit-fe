import { Flame, Dumbbell, Wind, type LucideIcon } from "lucide-react";

import type {
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet as ApiWorkoutSet,
} from "@/types/workout";
import {
  formatSetDistance,
  formatSetReps,
  formatSetTime,
  formatSetWeight,
} from "@/lib/workoutFormat";

/* ── Display types ── */

export type ExerciseType = "strength" | "cardio" | "mobility";

export type LogEntry = {
  id: string;
  weight?: string;
  reps?: string;
  time?: string;
  distance?: string;
  notes?: string;
  createdAt: number;
};

export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  primaryMuscle?: MuscleGroup;
  image: string;
  gradient: string;
  sets?: number;
  reps?: string;
  weight?: string;
  time?: string;
  type: ExerciseType;
  logs: LogEntry[];
};

export type SectionKey = "warmup" | "workout" | "stretch";

export type Section = {
  key: SectionKey;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  exercises: Exercise[];
};

/* ── Constants ── */

export const MUSCLE_GROUP_NAMES: Record<MuscleGroup, string> = {
  CHEST: "Chest",
  BACK: "Back",
  LEGS: "Legs",
  SHOULDERS: "Shoulders",
  BICEPS: "Biceps",
  TRICEPS: "Triceps",
  CORE: "Core",
  GLUTES: "Glutes",
  HAMSTRINGS: "Hamstrings",
  CALVES: "Calves",
  FULL_BODY: "Full Body",
};

export const MUSCLE_GROUP_EMOJI: Record<MuscleGroup, string> = {
  CHEST: "🏋️",
  BACK: "🤾",
  LEGS: "🦵",
  SHOULDERS: "💪",
  BICEPS: "💪",
  TRICEPS: "💪",
  CORE: "🧘",
  GLUTES: "🦵",
  HAMSTRINGS: "🦵",
  CALVES: "🦵",
  FULL_BODY: "🤸",
};

const gradients = [
  "from-emerald-500/30 to-teal-500/10",
  "from-orange-500/30 to-rose-500/10",
  "from-sky-500/30 to-indigo-500/10",
  "from-violet-500/30 to-fuchsia-500/10",
  "from-amber-500/30 to-yellow-500/10",
  "from-rose-500/30 to-pink-500/10",
];

export const pickGradient = (seed: string) =>
  gradients[Math.abs([...seed].reduce((a, c) => a + c.charCodeAt(0), 0)) % gradients.length];

const SECTION_CONFIG: Record<SectionKey, { title: string; subtitle: string; icon: LucideIcon }> = {
  warmup: { title: "Warm Up", subtitle: "Prepare your body", icon: Flame },
  workout: { title: "Workout", subtitle: "Main session", icon: Dumbbell },
  stretch: { title: "Stretch", subtitle: "Cool down", icon: Wind },
};

export const PHASE_TO_SECTION: Record<string, SectionKey> = {
  WARMUP: "warmup",
  MAIN: "workout",
  STRETCHING: "stretch",
};

export const SECTION_TO_PHASE: Record<SectionKey, string> = {
  warmup: "WARMUP",
  workout: "MAIN",
  stretch: "STRETCHING",
};

const PHASE_TO_TYPE: Record<string, ExerciseType> = {
  WARMUP: "cardio",
  MAIN: "strength",
  STRETCHING: "mobility",
};

export type LibraryItem = {
  alternativeId: string;
  name: string;
  muscle: string;
  primaryMuscle: MuscleGroup;
  image: string;
  gradient: string;
  type: ExerciseType;
  sets?: number;
  reps?: string;
  weight?: string;
  time?: string;
  distance?: string;
};

export function workoutExerciseToLibraryItem(ex: WorkoutExercise): LibraryItem {
  return {
    alternativeId: ex.exerciseId,
    name: ex.exerciseName,
    primaryMuscle: ex.primaryMuscle,
    muscle: MUSCLE_GROUP_NAMES[ex.primaryMuscle] ?? ex.primaryMuscle,
    image: MUSCLE_GROUP_EMOJI[ex.primaryMuscle] ?? "🏋️",
    gradient: pickGradient(ex.exerciseName),
    type: PHASE_TO_TYPE[ex.phase] ?? "strength",
    sets: ex.targetSets,
    reps: ex.targetReps ?? undefined,
    time: ex.targetDurationSeconds != null ? formatSetTime(ex.targetDurationSeconds) : undefined,
  };
}

/* ── Helpers ── */

function mapSetToLogEntry(set: ApiWorkoutSet): LogEntry {
  return {
    id: set.id,
    weight: formatSetWeight(set.weight),
    reps: formatSetReps(set.reps),
    time: formatSetTime(set.durationSeconds),
    distance: formatSetDistance(set.distance),
    notes: set.notes ?? undefined,
    createdAt: 0,
  };
}

/* ── Mapper ── */

export function mapWorkoutToSections(workout: Workout): Section[] {
  const emptySections: Section[] = (["warmup", "workout", "stretch"] as SectionKey[]).map((key) => {
    const cfg = SECTION_CONFIG[key];
    return { key, title: cfg.title, subtitle: cfg.subtitle, icon: cfg.icon, exercises: [] };
  });

  for (const ex of workout.exercises) {
    const sectionKey = PHASE_TO_SECTION[ex.phase] ?? "workout";
    const section = emptySections.find((s) => s.key === sectionKey);
    if (!section) continue;

    const muscleName = MUSCLE_GROUP_NAMES[ex.primaryMuscle] ?? ex.primaryMuscle;
    const firstSet = ex.sets[0];

    section.exercises.push({
      id: ex.id,
      name: ex.exerciseName,
      muscle: muscleName,
      primaryMuscle: ex.primaryMuscle,
      image: MUSCLE_GROUP_EMOJI[ex.primaryMuscle] ?? "🏋️",
      gradient: pickGradient(ex.exerciseName),
      sets: ex.targetSets,
      reps: ex.targetReps ?? undefined,
      weight: firstSet?.weight != null ? `${firstSet.weight} kg` : undefined,
      time: ex.targetDurationSeconds != null ? formatSetTime(ex.targetDurationSeconds) : undefined,
      type: PHASE_TO_TYPE[ex.phase] ?? "strength",
      logs: ex.sets.map(mapSetToLogEntry),
    });
  }

  return emptySections;
}
