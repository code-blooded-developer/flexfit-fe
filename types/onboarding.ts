import { LucideIcon } from "lucide-react";

import {
  Gender,
  FitnessGoal,
  ExperienceLevel,
  WorkoutEnvironment,
  HeightUnit,
  WeightUnit,
  WorkoutSplit,
} from "@/types/auth";

export interface OnboardingPayload {
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  workoutEnvironment: WorkoutEnvironment;
  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;
  workoutSplit: WorkoutSplit;
  height: number;
  heightUnit: HeightUnit;
  weight: number;
  weightUnit: WeightUnit;
  gender: Gender;
  dateOfBirth: Date;
}

export interface OnboardingAnswers {
  fitnessGoal: string;
  experienceLevel: string;
  workoutEnvironment: string;
  workoutDaysPerWeek: string;
  workoutDurationMinutes: string;
  workoutSplit: string;
}

export interface ProfileAnswers {
  height: string;
  heightUnit: HeightUnit;
  weight: string;
  weightUnit: WeightUnit;
  gender: string;
  dateOfBirth: string;
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
