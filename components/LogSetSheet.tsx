"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ErrorMsg } from "@/components/ErrorMsg";
import { formatSetSummary, formatSetTime } from "@/lib/workoutFormat";
import type { WorkoutExercise, WorkoutSet, WorkoutSetInput } from "@/types/workout";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: WorkoutExercise | null;
  onSubmit: (data: WorkoutSetInput) => void;
  onDeleteSet: (setId: string) => void;
  saving?: boolean;
  error?: string | null;
};

/* ── Prefill helpers ── */

const lastSet = (exercise: WorkoutExercise): WorkoutSet | null =>
  exercise.sets.reduce<WorkoutSet | null>(
    (latest, s) => (latest === null || s.setNumber > latest.setNumber ? s : latest),
    null,
  );

const nextSetNumber = (exercise: WorkoutExercise) =>
  exercise.sets.reduce((max, s) => Math.max(max, s.setNumber), 0) + 1;

/** Lowest number in a target range — "8-12" → 8. */
function lowBound(targetReps: string | null): number | null {
  if (!targetReps) return null;
  const match = targetReps.match(/\d+/);
  return match ? Number(match[0]) : null;
}

/* ── Validation ── */

const LIMITS = {
  weight: { min: 0, max: 999, unit: "kg", integer: false },
  reps: { min: 1, max: 999, unit: "reps", integer: true },
  duration: { min: 1, max: 7200, unit: "seconds", integer: true },
  distance: { min: 0, max: 100, unit: "km", integer: false },
} as const;

/** Backend stores notes in a varchar(255). */
const NOTES_MAX = 255;

// Rejects "-5", "1e3", "0x10" and "1.2.3"; accepts "60", "60.5", "60,5".
const DECIMAL_RE = /^\d+(?:[.,]\d+)?$/;
const INTEGER_RE = /^\d+$/;

/** `null` = empty field, `"invalid"` = unparseable. */
type Parsed = number | null | "invalid";

function parseDecimal(raw: string): Parsed {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!DECIMAL_RE.test(trimmed)) return "invalid";
  return Number(trimmed.replace(",", "."));
}

function parseInteger(raw: string): Parsed {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!INTEGER_RE.test(trimmed)) return "invalid";
  return Number(trimmed);
}

type Limit = (typeof LIMITS)[keyof typeof LIMITS];

/** Error message for a parsed value, or null when it is acceptable. */
function validateField(
  value: Parsed,
  limit: Limit,
  opts: { required: boolean; label: string },
): string | null {
  if (value === "invalid") {
    return limit.integer ? "Enter a whole number" : "Enter a number";
  }
  if (value === null) {
    return opts.required ? `${opts.label} is required` : null;
  }
  if (value < limit.min || value > limit.max) {
    return `Enter ${limit.min}–${limit.max} ${limit.unit}`;
  }
  return null;
}

const asNumber = (value: Parsed): number | null =>
  typeof value === "number" ? value : null;

/** Red border on invalid fields, matching lib/fieldClass.ts. */
const inputClass = (hasError: boolean) =>
  hasError ? "border-destructive focus-visible:ring-destructive" : undefined;

const round2 = (value: number) => Math.round(value * 100) / 100;

const initialValue = (value: number | null | undefined) =>
  value != null ? String(value) : "";

/* ── Form ── */

type FormProps = Omit<Props, "open" | "onOpenChange" | "exercise"> & {
  exercise: WorkoutExercise;
};

function LogSetForm({
  exercise,
  onSubmit,
  onDeleteSet,
  saving = false,
  error,
}: FormProps) {
  const isReps = exercise.measurementType === "REPS";
  const showDistance = exercise.exerciseType === "CARDIO";
  const previous = lastSet(exercise);
  const setNumber = nextSetNumber(exercise);

  const [weight, setWeight] = useState(initialValue(previous?.weight));
  const [reps, setReps] = useState(
    previous?.reps != null
      ? String(previous.reps)
      : isReps
        ? initialValue(lowBound(exercise.targetReps))
        : "",
  );
  const [duration, setDuration] = useState(
    previous?.durationSeconds != null
      ? String(previous.durationSeconds)
      : initialValue(exercise.targetDurationSeconds),
  );
  const [distance, setDistance] = useState(initialValue(previous?.distance));
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleSave = () => {
    const parsedWeight = isReps ? parseDecimal(weight) : null;
    const parsedReps = isReps ? parseInteger(reps) : null;
    const parsedDuration = isReps ? null : parseInteger(duration);
    const parsedDistance = showDistance ? parseDecimal(distance) : null;
    const trimmedNotes = notes.trim();

    const errors: Record<string, string> = {};

    if (isReps) {
      const weightError = validateField(parsedWeight, LIMITS.weight, {
        required: false,
        label: "Weight",
      });
      if (weightError) errors.weight = weightError;

      const repsError = validateField(parsedReps, LIMITS.reps, {
        required: true,
        label: "Reps",
      });
      if (repsError) errors.reps = repsError;
    } else {
      const durationError = validateField(parsedDuration, LIMITS.duration, {
        required: true,
        label: "Duration",
      });
      if (durationError) errors.duration = durationError;
    }

    if (showDistance) {
      const distanceError = validateField(parsedDistance, LIMITS.distance, {
        required: false,
        label: "Distance",
      });
      if (distanceError) errors.distance = distanceError;
    }

    if (trimmedNotes.length > NOTES_MAX) {
      errors.notes = `Keep notes under ${NOTES_MAX} characters`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const submittedWeight = asNumber(parsedWeight);
    const submittedDistance = asNumber(parsedDistance);

    onSubmit({
      setNumber,
      weight: submittedWeight === null ? null : round2(submittedWeight),
      reps: asNumber(parsedReps),
      durationSeconds: asNumber(parsedDuration),
      distance: submittedDistance === null ? null : round2(submittedDistance),
      notes: trimmedNotes || null,
    });
  };

  const durationHint = (() => {
    const n = parseInteger(duration);
    return typeof n === "number" && n >= 60
      ? `≈ ${Math.round(n / 60)} min`
      : null;
  })();

  const notesLength = notes.trim().length;

  const target = isReps
    ? exercise.targetReps
      ? `${exercise.targetReps} reps`
      : null
    : exercise.targetDurationSeconds != null
      ? formatSetTime(exercise.targetDurationSeconds)
      : null;

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="font-display">
          Log {exercise.exerciseName}
        </SheetTitle>
        <SheetDescription>
          {setNumber > exercise.targetSets
            ? `Set ${setNumber}`
            : `Set ${setNumber} of ${exercise.targetSets}`}
          {target ? ` · Target ${target}` : ""}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-5 flex flex-col gap-3 pb-4">
        {error && (
          <p className="text-xs text-destructive px-1">{error}</p>
        )}

        {isReps ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Weight (kg)
              </label>
              <Input
                inputMode="decimal"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  clearFieldError("weight");
                }}
                placeholder="e.g. 60"
                aria-invalid={!!fieldErrors.weight}
                className={inputClass(!!fieldErrors.weight)}
              />
              <ErrorMsg msg={fieldErrors.weight} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Reps
              </label>
              <Input
                inputMode="numeric"
                value={reps}
                onChange={(e) => {
                  setReps(e.target.value);
                  clearFieldError("reps");
                }}
                placeholder="e.g. 10"
                aria-invalid={!!fieldErrors.reps}
                className={inputClass(!!fieldErrors.reps)}
              />
              <ErrorMsg msg={fieldErrors.reps} />
            </div>
          </div>
        ) : (
          <div className={showDistance ? "grid grid-cols-2 gap-3" : ""}>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Duration (seconds)
              </label>
              <Input
                inputMode="numeric"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  clearFieldError("duration");
                }}
                placeholder="e.g. 30"
                aria-invalid={!!fieldErrors.duration}
                className={inputClass(!!fieldErrors.duration)}
              />
              {durationHint && (
                <p className="text-[11px] text-muted-foreground mt-1 px-1">
                  {durationHint}
                </p>
              )}
              <ErrorMsg msg={fieldErrors.duration} />
            </div>
            {showDistance && (
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Distance (km)
                </label>
                <Input
                  inputMode="decimal"
                  value={distance}
                  onChange={(e) => {
                    setDistance(e.target.value);
                    clearFieldError("distance");
                  }}
                  placeholder="e.g. 3"
                  aria-invalid={!!fieldErrors.distance}
                  className={inputClass(!!fieldErrors.distance)}
                />
                <ErrorMsg msg={fieldErrors.distance} />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">
            Notes
          </label>
          <Input
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              clearFieldError("notes");
            }}
            placeholder="Optional"
            aria-invalid={!!fieldErrors.notes}
            className={inputClass(!!fieldErrors.notes)}
          />
          {notesLength > 200 && (
            <p
              className={`text-[11px] mt-1 px-1 ${
                notesLength > NOTES_MAX
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {notesLength}/{NOTES_MAX}
            </p>
          )}
          <ErrorMsg msg={fieldErrors.notes} />
        </div>

        {exercise.sets.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-2">Logged sets</p>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {[...exercise.sets]
                .sort((a, b) => a.setNumber - b.setNumber)
                .map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary text-xs"
                  >
                    <span className="text-muted-foreground shrink-0">
                      Set {set.setNumber}
                    </span>
                    <span className="text-foreground truncate flex-1">
                      {formatSetSummary(set) || "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteSet(set.id)}
                      aria-label={`Delete set ${set.setNumber}`}
                      className="text-muted-foreground shrink-0 cursor-pointer p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="mt-3 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving" : "Save set"}
        </motion.button>
      </div>
    </>
  );
}

/* ── Sheet ── */

export default function LogSetSheet({
  open,
  onOpenChange,
  exercise,
  onSubmit,
  onDeleteSet,
  saving = false,
  error,
}: Props) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-border bg-background max-h-[90vh] overflow-y-auto"
      >
        {exercise && (
          // Remount when the exercise or its set count changes so the fields
          // pick up the new prefill instead of holding stale input.
          <LogSetForm
            key={`${exercise.id}-${exercise.sets.length}`}
            exercise={exercise}
            onSubmit={onSubmit}
            onDeleteSet={onDeleteSet}
            saving={saving}
            error={error}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
