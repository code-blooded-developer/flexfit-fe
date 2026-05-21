"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient();

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    // Zustand state is in-memory — on hard refresh, state is gone
    // Middleware handles redirect via cookie check
    // Just mark loading as done
    clearAuth();
  }, [clearAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
}
