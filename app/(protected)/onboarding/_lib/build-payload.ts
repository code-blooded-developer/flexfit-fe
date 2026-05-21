import { narrow } from "@/lib/narrow";

import type {
  OnboardingAnswers,
  OnboardingPayload,
  ProfileAnswers,
} from "@/types/onboarding";

import type {
  FitnessGoal,
  ExperienceLevel,
  WorkoutEnvironment,
  Gender,
} from "@/types/auth";

const FITNESS_GOALS: readonly FitnessGoal[] = [
  "LOSE_WEIGHT",
  "GAIN_MUSCLE",
  "MAINTAIN_FITNESS",
  "RECOMPOSITION",
];

const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];

const WORKOUT_ENVIRONMENTS: readonly WorkoutEnvironment[] = [
  "HOME",
  "GYM",
  "SOCIETY_GYM",
];

const GENDERS: readonly Gender[] = ["MALE", "FEMALE", "OTHER"];

export function buildPayload(
  answers: OnboardingAnswers,
  profile: ProfileAnswers,
): OnboardingPayload {
  return {
    fitnessGoal: narrow(answers.fitnessGoal, FITNESS_GOALS),
    experienceLevel: narrow(answers.experienceLevel, EXPERIENCE_LEVELS),
    workoutEnvironment: narrow(answers.workoutEnvironment, WORKOUT_ENVIRONMENTS),
    workoutDaysPerWeek: Number(answers.workoutDaysPerWeek),
    workoutDurationMinutes: Number(answers.workoutDurationMinutes),
    height: Number(profile.height),
    heightUnit: profile.heightUnit,
    weight: Number(profile.weight),
    weightUnit: profile.weightUnit,
    gender: narrow(profile.gender, GENDERS),
    dateOfBirth: new Date(profile.dateOfBirth),
  };
}
