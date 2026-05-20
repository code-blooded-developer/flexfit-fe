import type {
  OnboardingAnswers,
  OnboardingPayload,
  ProfileAnswers,
} from "@/types/onboarding";

export function buildPayload(
  answers: OnboardingAnswers,
  profile: ProfileAnswers,
): OnboardingPayload {
  return {
    fitnessGoal: answers.fitnessGoal as OnboardingPayload["fitnessGoal"],

    experienceLevel:
      answers.experienceLevel as OnboardingPayload["experienceLevel"],

    workoutEnvironment:
      answers.workoutEnvironment as OnboardingPayload["workoutEnvironment"],

    workoutDaysPerWeek: Number(answers.workoutDaysPerWeek),

    workoutDurationMinutes: Number(answers.workoutDurationMinutes),

    height: Number(profile.height),

    heightUnit: profile.heightUnit,

    weight: Number(profile.weight),

    weightUnit: profile.weightUnit,

    gender: profile.gender as OnboardingPayload["gender"],

    dateOfBirth: new Date(profile.dateOfBirth),
  };
}
