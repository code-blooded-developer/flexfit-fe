"use client";

import { useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/profileService";

export function useUserProfile() {
  const query = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => profileService.getProfile(),
    retry: false,
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
