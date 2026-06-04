"use client";

import { useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/profileService";
import { normalizeError } from "@/lib/errorUtils";

export function useUserProfile() {
  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => profileService.getProfile(),
    retry: false,
  });

  return {
    profile: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error ? normalizeError(query.error) : null,
  };
}
