"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { onboardingService } from "@/services/onboardingService";

import { ApiError } from "@/lib/apiError";

import type { OnboardingPayload } from "@/types/onboarding";

export function useCompleteOnboarding() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (payload: OnboardingPayload) =>
      onboardingService.complete(payload),

    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const completeOnboarding = async (payload: OnboardingPayload) => {
    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }

      throw new Error("Something went wrong. Please try again.");
    }
  };

  return {
    completeOnboarding,
    isLoading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}
