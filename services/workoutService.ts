import api from "@/lib/api";
import type { Workout } from "@/types/workout";

export const workoutService = {
  getTodayWorkout: () => api.get<Workout>("/workouts/today"),
};
