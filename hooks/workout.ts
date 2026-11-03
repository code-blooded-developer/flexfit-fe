"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { workoutService } from "@/services/workoutService";
import { useWorkoutStore } from "@/store/workoutStore";
import { normalizeError } from "@/lib/errorUtils";
import type {
  Workout,
  WorkoutExercise,
  WorkoutSetInput,
  ExerciseCategory,
  MuscleGroup,
  AlternateMuscle,
} from "@/types/workout";

/* ── Query: today's workout ── */

export function useWorkout() {
  const query = useQuery<Workout>({
    queryKey: ["todayWorkout"],
    queryFn: () => workoutService.getTodayWorkout(),
    retry: false,
  });

  const { setTodayWorkout, setLoading, setError } = useWorkoutStore();

  useEffect(() => {
    setLoading(query.isPending);
  }, [query.isPending, setLoading]);

  useEffect(() => {
    if (query.data) {
      setTodayWorkout(query.data);
    }
  }, [query.data, setTodayWorkout]);

  useEffect(() => {
    if (query.error) {
      setError(normalizeError(query.error, "Failed to load workout"));
    }
  }, [query.error, setError]);

  return query;
}

/* ── Query: alternate muscles ── */

export function useAlternateMuscles(
  currentMuscle?: MuscleGroup | string | null,
  enabled: boolean = true,
) {
  const query = useQuery<AlternateMuscle[]>({
    queryKey: ["alternateMuscles", currentMuscle],
    queryFn: () => workoutService.getAlternateMuscles(currentMuscle),
    enabled: enabled && !!currentMuscle,
    retry: false,
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error
      ? normalizeError(query.error, "Failed to load alternate muscles")
      : null,
    refetch: query.refetch,
  };
}

/* ── Query: exercise alternatives ── */

export function useAlternatives(
  workoutId: string | null,
  category?: ExerciseCategory | null,
  muscle?: MuscleGroup | null,
) {
  const query = useQuery<WorkoutExercise[]>({
    queryKey: ["alternatives", workoutId, category, muscle],
    queryFn: () => {
      const params: { category?: ExerciseCategory; muscle?: MuscleGroup } = {};
      if (category) params.category = category;
      if (muscle) params.muscle = muscle;
      return workoutService.getAlternatives(workoutId!, params);
    },
    enabled: !!workoutId && !!category,
    retry: false,
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    error: query.error ? normalizeError(query.error) : null,
  };
}

/* ── Mutation: add exercises to workout ── */

type AddExercisesVars = {
  workoutId: string;
  exerciseIds: string[];
};

export function useAddExercises() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ workoutId, exerciseIds }: AddExercisesVars) =>
      workoutService.addExercises(workoutId, exerciseIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
  };
}

/* ── Mutation: replace exercise ── */

type ReplaceVars = {
  workoutId: string;
  exerciseId: string;
  alternativeId: string;
};

export function useReplaceExercise() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ workoutId, exerciseId, alternativeId }: ReplaceVars) =>
      workoutService.replaceExercise(workoutId, exerciseId, alternativeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
    reset: mutation.reset,
  };
}

/* ── Mutation: delete exercise ── */

type DeleteVars = {
  workoutId: string;
  exerciseId: string;
};

export function useDeleteExercise() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ workoutId, exerciseId }: DeleteVars) =>
      workoutService.deleteExercise(workoutId, exerciseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
  };
}

/* ── Mutation: swap today's workout muscle ── */

export function useSwapWorkout() {
  const qc = useQueryClient();
  const { setTodayWorkout } = useWorkoutStore();

  const mutation = useMutation({
    mutationFn: (muscle: MuscleGroup | string) =>
      workoutService.swapTodayWorkout(muscle),
    onSuccess: (newWorkout) => {
      setTodayWorkout(newWorkout);
      qc.setQueryData(["todayWorkout"], newWorkout);
      qc.invalidateQueries({
        queryKey: ["todayWorkout"],
        refetchType: "none",
      });
      qc.invalidateQueries({
        queryKey: ["alternateMuscles"],
        refetchType: "none",
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
      ? normalizeError(mutation.error, "Failed to swap workout")
      : null,
    reset: mutation.reset,
  };
}

/* ── Mutation: log a set ── */

type LogSetVars = {
  workoutId: string;
  exerciseId: string;
  data: WorkoutSetInput;
};

export function useLogSet() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ workoutId, exerciseId, data }: LogSetVars) =>
      workoutService.logSet(workoutId, exerciseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
      ? normalizeError(mutation.error, "Failed to save set")
      : null,
    reset: mutation.reset,
  };
}

/* ── Mutation: delete a logged set ── */

type DeleteSetVars = {
  workoutId: string;
  exerciseId: string;
  setId: string;
};

export function useDeleteSet() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ workoutId, exerciseId, setId }: DeleteSetVars) =>
      workoutService.deleteSet(workoutId, exerciseId, setId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
      ? normalizeError(mutation.error, "Failed to delete set")
      : null,
    reset: mutation.reset,
  };
}

/* ── Mutation: mark the workout complete ── */

export function useCompleteWorkout() {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (workoutId: string) =>
      workoutService.completeWorkout(workoutId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error
      ? normalizeError(mutation.error, "Failed to complete workout")
      : null,
    reset: mutation.reset,
  };
}
