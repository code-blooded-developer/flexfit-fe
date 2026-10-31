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

/** `null` = empty field, `"invalid"` = unparseable. */
type Parsed = number | null | "invalid";

function parseNumber(raw: string): Parsed {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : "invalid";
}

function parseInteger(raw: string): Parsed {
  const n = parseNumber(raw);
  if (n === null || n === "invalid") return n;
  return Number.isInteger(n) ? n : "invalid";
}

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
    const parsedWeight = parseNumber(weight);
    const parsedReps = parseInteger(reps);
    const parsedDuration = parseInteger(duration);
    const parsedDistance = parseNumber(distance);

    const errors: Record<string, string> = {};
    if (isReps && parsedWeight === "invalid") errors.weight = "Enter a number";
    if (isReps && parsedReps === "invalid") errors.reps = "Enter a whole number";
    if (!isReps && parsedDuration === "invalid") {
      errors.duration = "Enter seconds as a whole number";
    }
    if (showDistance && parsedDistance === "invalid") {
      errors.distance = "Enter a number";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit({
      setNumber,
      weight: isReps && typeof parsedWeight === "number" ? parsedWeight : null,
      reps: isReps && typeof parsedReps === "number" ? parsedReps : null,
      durationSeconds:
        !isReps && typeof parsedDuration === "number" ? parsedDuration : null,
      distance:
        showDistance && typeof parsedDistance === "number" ? parsedDistance : null,
      notes: notes.trim() || null,
    });
  };

  const durationHint = (() => {
    const n = parseInteger(duration);
    return typeof n === "number" && n >= 60
      ? `≈ ${Math.round(n / 60)} min`
      : null;
  })();

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
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
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
