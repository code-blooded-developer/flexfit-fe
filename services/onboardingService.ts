import api from "@/lib/api";

import type { UserProfileResponse } from "@/types/auth";
import type { OnboardingPayload } from "@/types/onboarding";

export const onboardingService = {
  complete: (payload: OnboardingPayload) =>
    api.post<UserProfileResponse>("/profiles", payload),
};
