import { LucideIcon } from "lucide-react";

import {
  Gender,
  FitnessGoal,
  ExperienceLevel,
  WorkoutEnvironment,
} from "@/types/auth";

export interface OnboardingPayload {
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  workoutEnvironment: WorkoutEnvironment;
  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;
  height: number;
  weight: number;
  gender: Gender;
}

export interface OnboardingAnswers {
  fitnessGoal: string;
  experienceLevel: string;
  workoutEnvironment: string;
  workoutDaysPerWeek: string;
  workoutDurationMinutes: string;
}

export interface ProfileAnswers {
  height: string;
  weight: string;
  gender: string;
}

export interface StepOption {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  emoji?: string;
  description?: string;
}

export interface OnboardingStep {
  key: keyof OnboardingAnswers;
  title: string;
  subtitle: string;
  options: StepOption[];
}
