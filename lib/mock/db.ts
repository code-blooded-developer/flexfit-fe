import type {
  AlternateMuscle,
  ExerciseCategory,
  ExerciseType,
  MeasurementType,
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutSetInput,
} from "@/types/workout";

/* ── Exercise library ── */

type LibraryEntry = {
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  exerciseType: ExerciseType;
  measurementType: MeasurementType;
  targetReps: string | null;
  targetDurationSeconds: number | null;
  restSeconds: number | null;
  instructions: string;
};

const LIBRARY = {
  armCircles: {
    exerciseId: "ex-arm-circles",
    name: "Arm Circles",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: [],
    exerciseType: "ISOLATION",
    measurementType: "DURATION",
    targetReps: null,
    targetDurationSeconds: 30,
    restSeconds: 0,
    instructions:
      "Stand tall with arms out to the sides\nDraw small circles, then widen them\nKeep the shoulders down, away from the ears\nSwitch direction halfway through",
  },
  benchPress: {
    exerciseId: "ex-barbell-bench-press",
    name: "Barbell Bench Press",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["TRICEPS", "SHOULDERS"],
    exerciseType: "COMPOUND",
    measurementType: "REPS",
    targetReps: "8-12",
    targetDurationSeconds: null,
    restSeconds: 90,
    instructions:
      "Set up: feet planted, shoulder blades pinned\nGrip just outside shoulder width\nLower to the chest with control\nDrive up without bouncing\nReset your stance between reps",
  },
  inclinePress: {
    exerciseId: "ex-incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["SHOULDERS"],
    exerciseType: "COMPOUND",
    measurementType: "REPS",
    targetReps: "10-12",
    targetDurationSeconds: null,
    restSeconds: 90,
    instructions:
      "Set the bench to 30 degrees\nStart with the dumbbells at chest height\nPress up and slightly together\nLower slowly until you feel the stretch",
  },
  treadmill: {
    exerciseId: "ex-treadmill-intervals",
    name: "Treadmill Intervals",
    primaryMuscle: "LEGS",
    secondaryMuscles: ["CALVES"],
    exerciseType: "CARDIO",
    measurementType: "DURATION",
    targetReps: null,
    targetDurationSeconds: 300,
    restSeconds: 60,
    instructions:
      "Start with two minutes at an easy pace\nAlternate one minute fast, one minute easy\nLand mid-foot, keep the strides short\nCool down for the last minute",
  },
  chestStretch: {
    exerciseId: "ex-chest-stretch",
    name: "Doorway Chest Stretch",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["SHOULDERS"],
    exerciseType: "ISOLATION",
    measurementType: "DURATION",
    targetReps: null,
    targetDurationSeconds: 45,
    restSeconds: 0,
    instructions:
      "Place a forearm on the door frame\nStep through until you feel the stretch\nHold without bouncing\nBreathe out as you lean in",
  },
  legPress: {
    exerciseId: "ex-leg-press",
    name: "Leg Press",
    primaryMuscle: "LEGS",
    secondaryMuscles: ["GLUTES"],
    exerciseType: "COMPOUND",
    measurementType: "REPS",
    targetReps: "10-12",
    targetDurationSeconds: null,
    restSeconds: 120,
    instructions:
      "Feet shoulder width on the platform\nLower until the knees reach 90 degrees\nPress through the whole foot\nStop just short of locking out",
  },
  hamstringCurl: {
    exerciseId: "ex-hamstring-curl",
    name: "Seated Hamstring Curl",
    primaryMuscle: "HAMSTRINGS",
    secondaryMuscles: ["CALVES"],
    exerciseType: "ISOLATION",
    measurementType: "REPS",
    targetReps: "12-15",
    targetDurationSeconds: null,
    restSeconds: 75,
    instructions:
      "Line the knee up with the pivot\nCurl until the pad is under the seat\nSqueeze for a beat\nLower slowly against the pad",
  },
  calfRaise: {
    exerciseId: "ex-standing-calf-raise",
    name: "Standing Calf Raise",
    primaryMuscle: "CALVES",
    secondaryMuscles: [],
    exerciseType: "ISOLATION",
    measurementType: "REPS",
    targetReps: "15-20",
    targetDurationSeconds: null,
    restSeconds: 60,
    instructions:
      "Balls of the feet on the platform\nDrop the heels for a full stretch\nRise onto the toes and pause\nKeep the knees soft, not locked",
  },
} satisfies Record<string, LibraryEntry>;

type LibraryKey = keyof typeof LIBRARY;

/* ── Builders ── */

const today = () => new Date().toISOString().slice(0, 10);

function makeExercise(
  id: string,
  libraryKey: LibraryKey,
  phase: ExerciseCategory,
  sortOrder: number,
  targetSets: number,
): WorkoutExercise {
  const entry = LIBRARY[libraryKey];
  return {
    id,
    exerciseId: entry.exerciseId,
    exerciseName: entry.name,
    primaryMuscle: entry.primaryMuscle,
    secondaryMuscles: entry.secondaryMuscles,
    exerciseType: entry.exerciseType,
    measurementType: entry.measurementType,
    phase,
    sortOrder,
    targetSets,
    targetReps: entry.targetReps,
    targetDurationSeconds: entry.targetDurationSeconds,
    restSeconds: entry.restSeconds,
    notes: null,
    instructions: entry.instructions,
    thumbnailKey: null,
    videoKey: null,
    sets: [],
  };
}

function seedWorkout(): Workout {
  return {
    id: "w-today",
    date: today(),
    targetMuscle: "CHEST",
    totalDurationMinutes: 45,
    status: "PLANNED",
    exercises: [
      makeExercise("we-1", "armCircles", "WARMUP", 0, 1),
      makeExercise("we-2", "benchPress", "MAIN", 0, 3),
      makeExercise("we-3", "inclinePress", "MAIN", 1, 3),
      makeExercise("we-4", "treadmill", "MAIN", 2, 2),
      makeExercise("we-5", "chestStretch", "STRETCHING", 0, 1),
    ],
  };
}

/** A swapped workout gets a new id, mirroring the backend creating a new row. */
function seedSwappedWorkout(id: string, muscle: MuscleGroup): Workout {
  return {
    id,
    date: today(),
    targetMuscle: muscle,
    totalDurationMinutes: 40,
    status: "PLANNED",
    exercises: [
      makeExercise("we-swap-1", "legPress", "MAIN", 0, 3),
      makeExercise("we-swap-2", "hamstringCurl", "MAIN", 1, 3),
      makeExercise("we-swap-3", "calfRaise", "MAIN", 2, 3),
    ],
  };
}

/* ── In-memory store ── */

type MockDb = {
  workout: Workout;
  nextSetId: number;
  nextAddedId: number;
  swapCount: number;
};

const globalForMock = globalThis as typeof globalThis & {
  __flexfitMockDb?: MockDb;
};

const ALTERNATE_MUSCLES: AlternateMuscle[] = [
  { splitDayIndex: 1, name: "Push", muscle: "CHEST", targetMuscles: ["CHEST", "TRICEPS"] },
  { splitDayIndex: 2, name: "Pull", muscle: "BACK", targetMuscles: ["BACK", "BICEPS"] },
  { splitDayIndex: 3, name: "Legs", muscle: "LEGS", targetMuscles: ["LEGS", "GLUTES"] },
];

const ALTERNATIVE_KEYS: LibraryKey[] = ["benchPress", "inclinePress", "chestStretch"];

/**
 * Lives on `globalThis` so Next's dev-mode module reload doesn't wipe logged
 * sets halfway through a review.
 */
export function getDb(): MockDb {
  globalForMock.__flexfitMockDb ??= {
    workout: seedWorkout(),
    nextSetId: 1,
    nextAddedId: 1,
    swapCount: 0,
  };
  return globalForMock.__flexfitMockDb;
}

export function resetDb(): MockDb {
  globalForMock.__flexfitMockDb = {
    workout: seedWorkout(),
    nextSetId: 1,
    nextAddedId: 1,
    swapCount: 0,
  };
  return globalForMock.__flexfitMockDb;
}

/* ── Queries ── */

export const todayWorkout = (): Workout => getDb().workout;

export const alternateMuscles = (): AlternateMuscle[] => ALTERNATE_MUSCLES;

export function alternatives(): WorkoutExercise[] {
  return ALTERNATIVE_KEYS.map((key, index) =>
    makeExercise(`alt-${index + 1}`, key, "MAIN", index, 3),
  );
}

/* ── Mutations ── */

export function swapWorkout(muscle: string): Workout {
  const db = getDb();
  db.swapCount += 1;
  db.workout = seedSwappedWorkout(
    `w-today-swapped-${db.swapCount}`,
    (muscle as MuscleGroup) ?? "LEGS",
  );
  return db.workout;
}

export function addExercises(exerciseIds: string[]): Workout {
  const db = getDb();
  const known = new Set(Object.values(LIBRARY).map((entry) => entry.exerciseId));

  exerciseIds
    .filter((id) => known.has(id))
    .forEach((id, index) => {
      const key = (Object.keys(LIBRARY) as LibraryKey[]).find(
        (k) => LIBRARY[k].exerciseId === id,
      );
      if (!key) return;
      db.nextAddedId += 1;
      db.workout.exercises.push(
        makeExercise(`we-added-${db.nextAddedId}`, key, "MAIN", 90 + index, 3),
      );
    });

  return db.workout;
}

export function replaceExercise(
  exerciseId: string,
  alternativeId: string,
): Workout | null {
  const db = getDb();
  const exercise = db.workout.exercises.find((ex) => ex.id === exerciseId);
  const key = (Object.keys(LIBRARY) as LibraryKey[]).find(
    (k) => LIBRARY[k].exerciseId === alternativeId,
  );
  if (!exercise || !key) return null;

  const entry = LIBRARY[key];
  exercise.exerciseId = entry.exerciseId;
  exercise.exerciseName = entry.name;
  exercise.primaryMuscle = entry.primaryMuscle;
  exercise.secondaryMuscles = entry.secondaryMuscles;
  exercise.exerciseType = entry.exerciseType;
  exercise.measurementType = entry.measurementType;
  exercise.targetReps = entry.targetReps;
  exercise.targetDurationSeconds = entry.targetDurationSeconds;
  exercise.restSeconds = entry.restSeconds;
  exercise.instructions = entry.instructions;

  return db.workout;
}

export function deleteExercise(exerciseId: string): Workout | null {
  const db = getDb();
  const before = db.workout.exercises.length;
  db.workout.exercises = db.workout.exercises.filter((ex) => ex.id !== exerciseId);
  return db.workout.exercises.length === before ? null : db.workout;
}

export function logSet(
  exerciseId: string,
  input: WorkoutSetInput,
): WorkoutSet | null {
  const db = getDb();
  const exercise = db.workout.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return null;

  const set: WorkoutSet = {
    id: `set-${db.nextSetId}`,
    setNumber: input.setNumber,
    weight: input.weight ?? null,
    reps: input.reps ?? null,
    distance: input.distance ?? null,
    durationSeconds: input.durationSeconds ?? null,
    notes: input.notes ?? null,
  };

  db.nextSetId += 1;
  exercise.sets.push(set);
  return set;
}

export function deleteSet(exerciseId: string, setId: string): boolean {
  const db = getDb();
  const exercise = db.workout.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return false;
  const before = exercise.sets.length;
  exercise.sets = exercise.sets.filter((set) => set.id !== setId);
  return exercise.sets.length !== before;
}

export function completeWorkout(): Workout {
  const db = getDb();
  db.workout.status = "COMPLETED";
  return db.workout;
}

/* ── Introspection (reviewer tooling) ── */

export function dbSnapshot() {
  const db = getDb();
  return {
    workoutId: db.workout.id,
    date: db.workout.date,
    status: db.workout.status,
    exercises: db.workout.exercises.map((ex) => ({
      id: ex.id,
      name: ex.exerciseName,
      phase: ex.phase,
      targetSets: ex.targetSets,
      loggedSets: ex.sets.length,
      setNumbers: ex.sets.map((set) => set.setNumber),
    })),
  };
}
