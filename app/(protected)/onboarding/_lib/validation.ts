import type { ProfileAnswers } from "@/types/onboarding";

export function isProfileValid(profile: ProfileAnswers): boolean {
  const height = Number(profile.height);
  const weight = Number(profile.weight);

  return height >= 100 && height <= 250 && weight >= 30 && weight <= 300;
}
