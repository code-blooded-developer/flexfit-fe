import { Flame, Dumbbell, Wind, type LucideIcon } from "lucide-react";

import type {
  MuscleGroup,
  Workout,
  WorkoutSet as ApiWorkoutSet,
} from "@/types/workout";

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
  image: string;
  gradient: string;
  sets?: number;
  reps?: string;
  weight?: string;
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

const MUSCLE_GROUP_EMOJI: Record<MuscleGroup, string> = {
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

const PHASE_TO_SECTION: Record<string, SectionKey> = {
  WARMUP: "warmup",
  MAIN: "workout",
  STRETCHING: "stretch",
};

const PHASE_TO_TYPE: Record<string, ExerciseType> = {
  WARMUP: "cardio",
  MAIN: "strength",
  STRETCHING: "mobility",
};

export type LibraryItem = {
  name: string;
  muscle: string;
  image: string;
  gradient: string;
  type: ExerciseType;
  sets?: number;
  reps?: string;
  weight?: string;
  time?: string;
  distance?: string;
};

export const exerciseLibrary: LibraryItem[] = [
  { name: "Jumping Jacks", muscle: "Full Body", image: "🤸", gradient: pickGradient("Jumping Jacks"), type: "cardio", time: "2 min" },
  { name: "Arm Circles", muscle: "Shoulders", image: "💫", gradient: pickGradient("Arm Circles"), type: "mobility", reps: "20 each" },
  { name: "Treadmill Walk", muscle: "Cardio", image: "🏃", gradient: pickGradient("Treadmill Walk"), type: "cardio", time: "5 min" },
  { name: "Bench Press", muscle: "Chest", image: "🏋️", gradient: pickGradient("Bench Press"), type: "strength", sets: 4, reps: "8-10", weight: "60 kg" },
  { name: "Incline Dumbbell Press", muscle: "Upper Chest", image: "💪", gradient: pickGradient("Incline Dumbbell Press"), type: "strength", sets: 3, reps: "10-12", weight: "22 kg" },
  { name: "Shoulder Press", muscle: "Shoulders", image: "🏋️", gradient: pickGradient("Shoulder Press"), type: "strength", sets: 4, reps: "8-10", weight: "40 kg" },
  { name: "Lateral Raises", muscle: "Delts", image: "💪", gradient: pickGradient("Lateral Raises"), type: "strength", sets: 3, reps: "12-15", weight: "10 kg" },
  { name: "Tricep Pushdown", muscle: "Triceps", image: "💪", gradient: pickGradient("Tricep Pushdown"), type: "strength", sets: 3, reps: "12-15", weight: "25 kg" },
  { name: "Pull Ups", muscle: "Back", image: "🤾", gradient: pickGradient("Pull Ups"), type: "strength", sets: 4, reps: "8-10", weight: "BW" },
  { name: "Back Squat", muscle: "Legs", image: "🦵", gradient: pickGradient("Back Squat"), type: "strength", sets: 5, reps: "5-8", weight: "90 kg" },
  { name: "Plank", muscle: "Core", image: "🧘", gradient: pickGradient("Plank"), type: "mobility", time: "60 s" },
  { name: "Hamstring Stretch", muscle: "Hamstrings", image: "🧘", gradient: pickGradient("Hamstring Stretch"), type: "mobility", time: "45 s" },
  { name: "Child's Pose", muscle: "Back", image: "🧎", gradient: pickGradient("Child's Pose"), type: "mobility", time: "60 s" },
  { name: "Cat-Cow", muscle: "Spine", image: "🐈", gradient: pickGradient("Cat-Cow"), type: "mobility", reps: "10" },
];

/* ── Helpers ── */

function formatSetWeight(weight: number | null): string | undefined {
  if (weight === null) return undefined;
  return `${weight} kg`;
}

function formatSetReps(reps: number | null): string | undefined {
  if (reps === null) return undefined;
  return String(reps);
}

function formatSetTime(durationSeconds: number | null): string | undefined {
  if (durationSeconds === null) return undefined;
  if (durationSeconds >= 60) {
    return `${Math.round(durationSeconds / 60)} min`;
  }
  return `${durationSeconds} s`;
}

function formatSetDistance(distance: number | null): string | undefined {
  if (distance === null) return undefined;
  return `${distance} km`;
}

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
      image: MUSCLE_GROUP_EMOJI[ex.primaryMuscle] ?? "🏋️",
      gradient: pickGradient(ex.exerciseName),
      sets: ex.targetSets,
      reps: ex.targetReps,
      weight: firstSet?.weight != null ? `${firstSet.weight} kg` : undefined,
      type: PHASE_TO_TYPE[ex.phase] ?? "strength",
      logs: ex.sets.map(mapSetToLogEntry),
    });
  }

  return emptySections;
}
