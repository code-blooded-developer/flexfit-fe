import { create } from "zustand";
import { Role, UserProfileResponse } from "@/types/auth";

type AuthState = {
  id: string | null;
  email: string | null;
  role: Role | null;
  isProfileComplete: boolean;
  userProfile: UserProfileResponse | null;
  isLoading: boolean;
};

type AuthActions = {
  setAuthFromSignUp: (data: {
    id: string;
    email: string;
    role: Role;
    isProfileComplete: boolean;
  }) => void;
  setAuthFromSignIn: (data: {
    email: string;
    role: Role;
    isProfileComplete: boolean;
    userProfile: UserProfileResponse | null;
  }) => void;
  setProfileComplete: (profile: UserProfileResponse) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // state
  id: null,
  email: null,
  role: null,
  isProfileComplete: false,
  userProfile: null,
  isLoading: true,

  // actions
  setAuthFromSignUp: (data) =>
    set({
      id: data.id,
      email: data.email,
      role: data.role,
      isProfileComplete: data.isProfileComplete,
      userProfile: null,
      isLoading: false,
    }),

  setAuthFromSignIn: (data) =>
    set({
      email: data.email,
      role: data.role,
      isProfileComplete: data.isProfileComplete,
      userProfile: data.userProfile,
      isLoading: false,
    }),

  // called after onboarding completes
  setProfileComplete: (profile) =>
    set({
      isProfileComplete: true,
      userProfile: profile,
    }),

  clearAuth: () =>
    set({
      id: null,
      email: null,
      role: null,
      isProfileComplete: false,
      userProfile: null,
      isLoading: false,
    }),
}));
