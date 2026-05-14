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
    fitnessGoal: answers.goal as OnboardingPayload["fitnessGoal"],

    experienceLevel:
      answers.experienceLevel as OnboardingPayload["experienceLevel"],

    workoutEnvironment:
      answers.environment as OnboardingPayload["workoutEnvironment"],

    workoutDaysPerWeek: Number(answers.daysPerWeek),

    workoutDurationMinutes: Number(answers.duration),

    height: Number(profile.height),

    weight: Number(profile.weight),

    gender: profile.gender as OnboardingPayload["gender"],
  };
}
