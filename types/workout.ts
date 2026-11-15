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

export type ExerciseType = "COMPOUND" | "ISOLATION" | "CARDIO";

export type ExerciseCategory = "WARMUP" | "MAIN" | "STRETCHING";

/** How an exercise is measured — decides which fields a logged set carries. */
export type MeasurementType = "REPS" | "DURATION";

export type WorkoutSet = {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  distance: number | null;
  durationSeconds: number | null;
  notes: string | null;
};

/** Payload for POST/PUT /workouts/{workoutId}/exercises/{exerciseId}/sets. */
export type WorkoutSetInput = {
  setNumber: number;
  weight?: number | null;
  reps?: number | null;
  distance?: number | null;
  durationSeconds?: number | null;
  notes?: string | null;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  exerciseType: ExerciseType;
  measurementType: MeasurementType;
  phase: ExerciseCategory;
  sortOrder: number;
  targetSets: number;
  targetReps: string | null;
  targetDurationSeconds: number | null;
  restSeconds: number | null;
  notes: string | null;
  instructions: string | null;
  thumbnailKey: string | null;
  videoKey: string | null;
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

/**
 * One row of `GET /workouts/history`. Enough to list past sessions — not the
 * full workout, which is only fetched for today.
 */
export type WorkoutSummary = {
  id: string;
  /** `YYYY-MM-DD`, the date the session belongs to. */
  date: string;
  targetMuscle: MuscleGroup;
  exerciseCount: number;
  /** What the plan asked for. */
  totalDurationMinutes: number | null;
  /** What the clock recorded. Zero while the workout is unfinished. */
  elapsedSeconds: number;
  status: WorkoutStatus;
  /** ISO timestamp, set once the session is completed. */
  completedAt: string | null;
};

export type AlternateMuscle = {
  splitDayIndex: number;
  name: string;
  muscle: MuscleGroup;
  targetMuscles: MuscleGroup[];
};
