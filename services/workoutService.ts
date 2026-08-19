import api from "@/lib/api";
import type { Workout, WorkoutExercise, ExerciseCategory, MuscleGroup } from "@/types/workout";

export const workoutService = {
  getTodayWorkout: () => api.get<Workout>("/workouts/today"),
  getAlternatives: (
    workoutId: string,
    params?: { category?: ExerciseCategory; muscle?: MuscleGroup },
  ) =>
    api.get<WorkoutExercise[]>(
      `/workouts/${workoutId}/alternatives`,
      { params: params as Record<string, string> | undefined },
    ),
  replaceExercise: (workoutId: string, exerciseId: string, alternativeId: string) =>
    api.put(`/workouts/${workoutId}/exercises/${exerciseId}/replace/${alternativeId}`),
  deleteExercise: (workoutId: string, exerciseId: string) =>
    api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`),
  addExercises: (workoutId: string, exerciseIds: string[]) =>
    api.post(`/workouts/${workoutId}/exercises`, { exerciseIds }),
};
