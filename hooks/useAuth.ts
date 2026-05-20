"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/apiError";

export function useAuth() {
  const router = useRouter();
  const { setAuthFromSignUp, setAuthFromSignIn, clearAuth } = useAuthStore();

  const signUpMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      authService.signUp(data.name, data.email, data.password),

    onSuccess: (data) => {
      setAuthFromSignUp(data);
      router.push("/onboarding");
    },
  });

  const signInMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.signIn(data.email, data.password),

    onSuccess: (data) => {
      setAuthFromSignIn({
        email: data.email,
        role: data.role,
        isProfileComplete: data.isProfileComplete,
        userProfile: data.userProfile,
      });
      router.push(data.isProfileComplete ? "/dashboard" : "/onboarding");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      clearAuth();
      router.push("/login");
    },
  });

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await signUpMutation.mutateAsync({ name, email, password });
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error("Something went wrong. Please try again.");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password });
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }
      throw new Error("Something went wrong. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      clearAuth();
      router.push("/login");
    }
  };

  const isLoading = signUpMutation.isPending || signInMutation.isPending;

  const error =
    signUpMutation.error instanceof Error
      ? signUpMutation.error.message
      : signInMutation.error instanceof Error
        ? signInMutation.error.message
        : null;

  return { signUp, signIn, logout, error, isLoading };
}