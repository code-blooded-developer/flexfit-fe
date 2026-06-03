import { create } from "zustand";

import type { Workout } from "@/types/workout";

type WorkoutStore = {
  todayWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;

  setTodayWorkout: (workout: Workout) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTodayWorkout: () => void;
};

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  todayWorkout: null,
  isLoading: false,
  error: null,

  setTodayWorkout: (workout) => set({ todayWorkout: workout, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, todayWorkout: null }),
  clearTodayWorkout: () => set({ todayWorkout: null, isLoading: false, error: null }),
}));
