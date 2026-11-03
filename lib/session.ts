import type { ExerciseCategory, Workout, WorkoutExercise } from "@/types/workout";

/* ── Session ordering ── */

/** Where a session currently is / where it goes next. */
export type SessionStep = {
  exerciseId: string;
  setNumber: number;
};

const PHASE_ORDER: Record<ExerciseCategory, number> = {
  WARMUP: 0,
  MAIN: 1,
  STRETCHING: 2,
};

/** `sortOrder` restarts per phase, so phase has to be the primary key. */
export function orderedExercises(workout: Workout): WorkoutExercise[] {
  return [...workout.exercises].sort(
    (a, b) =>
      PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] || a.sortOrder - b.sortOrder,
  );
}

export function exerciseById(
  workout: Workout | null,
  exerciseId: string | null | undefined,
): WorkoutExercise | null {
  if (!workout || !exerciseId) return null;
  return workout.exercises.find((ex) => ex.id === exerciseId) ?? null;
}

/** An exercise with no target still counts as one set — never zero. */
export const targetSetCount = (exercise: WorkoutExercise) =>
  Math.max(exercise.targetSets || 0, 1);

/** The plan leaves warmups without rest, but they still need a breather. */
export const WARMUP_REST_SECONDS = 60;

/**
 * Rest after a set. Uses the planned value, falling back to a short default
 * for warmups (every warmup row stores 0) and to none for everything else.
 */
export function restSecondsFor(exercise: WorkoutExercise): number {
  const planned = exercise.restSeconds ?? 0;
  if (planned > 0) return planned;
  return exercise.phase === "WARMUP" ? WARMUP_REST_SECONDS : 0;
}

const isPending = (exercise: WorkoutExercise, skipped: string[]) =>
  !skipped.includes(exercise.id) &&
  exercise.sets.length < targetSetCount(exercise);

const stepFor = (exercise: WorkoutExercise): SessionStep => ({
  exerciseId: exercise.id,
  setNumber: exercise.sets.length + 1,
});

function nextPending(
  ordered: WorkoutExercise[],
  from: number,
  skipped: string[],
): SessionStep | null {
  for (let i = Math.max(from, 0); i < ordered.length; i += 1) {
    if (isPending(ordered[i], skipped)) return stepFor(ordered[i]);
  }
  return null;
}

/** Entry point for a fresh or resumed session — earliest unfinished exercise. */
export function firstStep(
  workout: Workout,
  skipped: string[] = [],
): SessionStep | null {
  return nextPending(orderedExercises(workout), 0, skipped);
}

/**
 * Where logging a set leads. `loggedAfter` is the exercise's set count
 * *including* the set just saved, so this works before the refetch lands.
 */
export function stepAfterSet(
  workout: Workout,
  exerciseId: string,
  loggedAfter: number,
  skipped: string[] = [],
): SessionStep | null {
  const ordered = orderedExercises(workout);
  const index = ordered.findIndex((ex) => ex.id === exerciseId);
  if (index === -1) return firstStep(workout, skipped);

  if (loggedAfter < targetSetCount(ordered[index])) {
    return { exerciseId, setNumber: loggedAfter + 1 };
  }

  return nextPending(ordered, index + 1, skipped);
}

/**
 * Where moving past an exercise leads — skipping it, or marking it done.
 * `excluded` is the union of skipped and completed ids.
 */
export function stepAfterExercise(
  workout: Workout,
  exerciseId: string,
  excluded: string[] = [],
): SessionStep | null {
  const ordered = orderedExercises(workout);
  const index = ordered.findIndex((ex) => ex.id === exerciseId);
  return nextPending(ordered, index + 1, excluded);
}

/* ── Display ── */

/** `m:ss` under an hour, `h:mm:ss` above it. */
export function formatSessionTime(ms: number): string {
  const total = Math.max(Math.floor(ms / 1000), 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
