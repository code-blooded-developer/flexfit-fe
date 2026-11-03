"use client";

import { useEffect, useState } from "react";

import {
  restRemainingMs as remainingOf,
  sessionElapsedMs,
  useSessionStore,
} from "@/store/sessionStore";

/** Re-renders once a second so relative clocks stay live. */
function useTick(active: boolean) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);
}

/**
 * Elapsed workout time and rest countdown, refreshed every second while the
 * session runs. Both values are derived from timestamps, so nothing drifts.
 */
export function useSessionClock() {
  const status = useSessionStore((s) => s.status);
  const accumulatedMs = useSessionStore((s) => s.accumulatedMs);
  const runningSince = useSessionStore((s) => s.runningSince);
  const rest = useSessionStore((s) => s.rest);

  useTick(status === "running");

  const remaining = rest ? remainingOf(rest) : null;
  const total = rest ? rest.durationSeconds * 1000 : 0;

  return {
    status,
    elapsedMs: sessionElapsedMs({ accumulatedMs, runningSince }),
    restRemainingMs: remaining,
    /** 0 at the start of a rest, 1 when it is over. */
    restProgress: remaining !== null && total > 0 ? 1 - remaining / total : 0,
  };
}
