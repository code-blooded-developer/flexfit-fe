import api from "@/lib/api";
import type { Workout, WorkoutExercise } from "@/types/workout";

export const workoutService = {
  getTodayWorkout: () => api.get<Workout>("/workouts/today"),
  getAlternatives: (workoutId: string, exerciseId: string) =>
    api.get<WorkoutExercise[]>(`/workouts/${workoutId}/exercises/${exerciseId}/alternatives`),
  replaceExercise: (workoutId: string, exerciseId: string, alternativeId: string) =>
    api.put(`/workouts/${workoutId}/exercises/${exerciseId}/replace/${alternativeId}`),
  deleteExercise: (workoutId: string, exerciseId: string) =>
    api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`),
};
