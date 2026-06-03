"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { workoutService } from "@/services/workoutService";
import { useWorkoutStore } from "@/store/workoutStore";
import type { Workout, WorkoutExercise, ExerciseCategory } from "@/types/workout";

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
      setError(query.error instanceof Error ? query.error.message : "Failed to load workout");
    }
  }, [query.error, setError]);

  return query;
}

/* ── Query: exercise alternatives ── */

export function useAlternatives(
  workoutId: string | null,
  category?: ExerciseCategory | null,
) {
  return useQuery<WorkoutExercise[]>({
    queryKey: ["alternatives", workoutId, category],
    queryFn: () => {
      const params: { category?: ExerciseCategory } = {};
      if (category) params.category = category;
      return workoutService.getAlternatives(workoutId!, params);
    },
    enabled: !!workoutId && !!category,
    retry: false,
  });
}

/* ── Mutation: add exercises to workout ── */

type AddExercisesVars = {
  workoutId: string;
  exerciseIds: string[];
};

export function useAddExercises() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, exerciseIds }: AddExercisesVars) =>
      workoutService.addExercises(workoutId, exerciseIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });
}

/* ── Mutation: replace exercise ── */

type ReplaceVars = {
  workoutId: string;
  exerciseId: string;
  alternativeId: string;
};

export function useReplaceExercise() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, exerciseId, alternativeId }: ReplaceVars) =>
      workoutService.replaceExercise(workoutId, exerciseId, alternativeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });
}

/* ── Mutation: delete exercise ── */

type DeleteVars = {
  workoutId: string;
  exerciseId: string;
};

export function useDeleteExercise() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ workoutId, exerciseId }: DeleteVars) =>
      workoutService.deleteExercise(workoutId, exerciseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todayWorkout"] });
    },
  });
}
