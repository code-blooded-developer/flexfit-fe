import type { WorkoutSet } from "@/types/workout";

/* Formatters shared by the workout list and the set-logging sheet. */

export function formatSetWeight(weight: number | null): string | undefined {
  if (weight === null) return undefined;
  return `${weight} kg`;
}

export function formatSetReps(reps: number | null): string | undefined {
  if (reps === null) return undefined;
  return String(reps);
}

export function formatSetTime(durationSeconds: number | null): string | undefined {
  if (durationSeconds === null) return undefined;
  if (durationSeconds >= 60) {
    return `${Math.round(durationSeconds / 60)} min`;
  }
  return `${durationSeconds} s`;
}

export function formatSetDistance(distance: number | null): string | undefined {
  if (distance === null) return undefined;
  return `${distance} km`;
}

/** One-line summary of a logged set, e.g. "60 kg · 10 · 3 km". */
export function formatSetSummary(set: WorkoutSet): string {
  return [
    formatSetWeight(set.weight),
    formatSetReps(set.reps),
    formatSetTime(set.durationSeconds),
    formatSetDistance(set.distance),
    set.notes ?? undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}
