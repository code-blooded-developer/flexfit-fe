"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { onboardingService } from "@/services/onboardingService";

import { normalizeError } from "@/lib/errorUtils";

import type { OnboardingPayload } from "@/types/onboarding";

export function useCompleteOnboarding() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: OnboardingPayload) =>
      onboardingService.complete(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      router.push("/equipment-selection");
    },
  });

  const completeOnboarding = async (payload: OnboardingPayload) => {
    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  };

  return {
    completeOnboarding,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
  };
}
