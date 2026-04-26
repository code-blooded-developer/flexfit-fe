import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/apiError";

export function useAuth() {
  const router = useRouter();
  const { setAuthFromSignUp, setAuthFromSignIn, clearAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authService.signUp(name, email, password);
      setAuthFromSignUp(data);
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message); // e.g. "Email already exists"
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await authService.signIn(email, password);
      setAuthFromSignIn({
        email: data.email,
        role: data.role,
        isProfileComplete: data.isProfileComplete,
        userProfile: data.userProfile,
      });
      router.push(data.isProfileComplete ? "/dashboard" : "/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message); // e.g. "Invalid credentials"
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      router.push("/auth/login");
    }
  };

  return { signUp, signIn, logout, error, isLoading };
}
