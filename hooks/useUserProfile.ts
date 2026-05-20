"use client";

import { useQuery } from "@tanstack/react-query";

import { onboardingService } from "@/services/profileService";

export function useUserProfile() {
  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => onboardingService.getProfile(),
    retry: false,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}