import type { ExerciseCategory } from "@/types/workout";

/**
 * Exercise cues ship from the API as one cue per line in
 * `WorkoutExercise.instructions`. The seeder writes 4–6 trimmed, newline
 * separated steps, so the client only has to split — never to infer sentence
 * boundaries, which would break on abbreviations and decimal weights.
 */

/** Shown only when an exercise has no cues of its own (legacy or unseeded rows). */
const FALLBACK_CUES: Record<ExerciseCategory, string[]> = {
  WARMUP: [
    "Find a steady rhythm you can sustain",
    "Land softly — avoid heel slamming",
    "Keep shoulders relaxed, arms loose",
    "Breathe in 2 counts, out 2 counts",
  ],
  MAIN: [
    "Set up: feet planted, grip secure",
    "Lower with control through the full range",
    "Drive through the working muscle, not momentum",
    "Lock out without hyperextending the joint",
    "Reset your stance between reps",
  ],
  STRETCHING: [
    "Move into the stretch slowly",
    "Hold the end range without bouncing",
    "Keep breathing — don't hold your breath",
    "Back off if you feel sharp pain",
  ],
};

/** Splits the newline-delimited cue blob into displayable steps. */
export function splitInstructions(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** The exercise's own cues, or a phase-appropriate fallback when it has none. */
export function resolveCues(
  raw: string | null | undefined,
  phase: ExerciseCategory,
): string[] {
  const cues = splitInstructions(raw);
  return cues.length > 0 ? cues : (FALLBACK_CUES[phase] ?? FALLBACK_CUES.MAIN);
}

/**
 * Rotating a single cue just makes the screen flicker, so short lists are held
 * statically instead.
 */
export function shouldRotate(cues: string[]): boolean {
  return cues.length > 1;
}
