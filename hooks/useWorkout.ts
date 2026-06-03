"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { workoutService } from "@/services/workoutService";
import { useWorkoutStore } from "@/store/workoutStore";
import type { Workout } from "@/types/workout";

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
