export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "CORE"
  | "GLUTES"
  | "HAMSTRINGS"
  | "CALVES"
  | "FULL_BODY";

export type WorkoutStatus = "PLANNED" | "COMPLETED" | "SKIPPED";

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: "Chest Day",
  BACK: "Back Day",
  LEGS: "Leg Day",
  SHOULDERS: "Shoulder Day",
  BICEPS: "Biceps Day",
  TRICEPS: "Triceps Day",
  CORE: "Core Day",
  GLUTES: "Glute Day",
  HAMSTRINGS: "Hamstring Day",
  CALVES: "Calf Day",
  FULL_BODY: "Full Body Day",
};

export type ExerciseType = "COMPOUND" | "ISOLATION";

export type ExerciseCategory = "WARMUP" | "MAIN" | "STRETCHING";

export type WorkoutSet = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  distance: number | null;
  durationSeconds: number | null;
  notes: string | null;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  exerciseType: ExerciseType;
  phase: ExerciseCategory;
  sortOrder: number;
  targetSets: number;
  targetReps: string;
  targetDurationSeconds: number | null;
  restSeconds: number | null;
  notes: string | null;
  mediaUrl: string | null;
  sets: WorkoutSet[];
};

export type Workout = {
  id: string;
  date: string;
  targetMuscle: MuscleGroup;
  totalDurationMinutes: number | null;
  status: WorkoutStatus;
  exercises: WorkoutExercise[];
};
