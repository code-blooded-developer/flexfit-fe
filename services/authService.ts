import api from "@/lib/api";
import { AuthResponse, UserResponse } from "@/types/auth";

export const authService = {
  signUp: (name: string, email: string, password: string) =>
    api.post<UserResponse>("/auth/signup", { name, email, password }),

  signIn: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),

  forgotPassword: (email: string) =>
    api.post<null>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<null>("/auth/reset-password", { token, newPassword }),

  logout: () => api.post<null>("/auth/logout"),
};
