export type WorkoutStatus = "PLANNED" | "COMPLETED" | "SKIPPED";

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
