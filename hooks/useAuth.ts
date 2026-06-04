"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/authService";
import { normalizeError } from "@/lib/errorUtils";

export function useAuth() {
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      authService.signUp(data.name, data.email, data.password),

    onSuccess: () => {
      router.push("/onboarding");
    },
  });

  const signInMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.signIn(data.email, data.password),

    onSuccess: (data) => {
      router.push(data.isProfileComplete ? "/dashboard" : "/onboarding");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
  });

  const signUp = async (name: string, email: string, password: string) => {
    await signUpMutation.mutateAsync({ name, email, password });
  };

  const signIn = async (email: string, password: string) => {
    await signInMutation.mutateAsync({ email, password });
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // ignore — still redirect
    }
    router.push("/login");
  };

  const isLoading = signUpMutation.isPending || signInMutation.isPending;

  const error = signUpMutation.error
    ? normalizeError(signUpMutation.error)
    : signInMutation.error
      ? normalizeError(signInMutation.error)
      : null;

  return { signUp, signIn, logout, error, isLoading };
}
