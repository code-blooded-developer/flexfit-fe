import api from "@/lib/api";

import type { UserProfileResponse } from "@/types/auth";

export const profileService = {
  getProfile: () => api.get<UserProfileResponse>("/profiles"),
};
