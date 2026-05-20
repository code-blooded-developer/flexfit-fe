import api from "@/lib/api";

import type { UserProfileResponse } from "@/types/auth";

export const onboardingService = {
  getProfile: () => api.get<UserProfileResponse>("/profiles"),
};
