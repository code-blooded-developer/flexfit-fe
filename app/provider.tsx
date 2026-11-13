"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSessionStore } from "@/store/sessionStore";
import { USE_MOCKS } from "@/lib/mock/config";

const queryClient = new QueryClient();

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Fixture mode: a cached worker would keep serving the pre-fix bundle,
    // which is the fastest way to "verify" code you no longer have.
    if (USE_MOCKS) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      return;
    }
    navigator.serviceWorker.register("/sw.js");
  }, []);

  useEffect(() => {
    // The session store hydrates manually so the first client render matches
    // the server's empty state. Coming back from a reload counts as leaving:
    // the clock is banked and frozen rather than accruing while the tab was shut.
    const finish = () => {
      const session = useSessionStore.getState();
      if (session.hydrated) return;
      if (session.status === "running") session.pause();
      session.setHydrated();
    };

    const unsubscribe = useSessionStore.persist.onFinishHydration(finish);
    void Promise.resolve(useSessionStore.persist.rehydrate()).then(finish);

    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </QueryClientProvider>
  );
}
