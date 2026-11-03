"use client";

import { motion } from "motion/react";
import { Pause, Play } from "lucide-react";

import { useSessionClock } from "@/hooks/useSession";
import { formatSessionTime } from "@/lib/session";
import { useSessionStore } from "@/store/sessionStore";

/**
 * Whole-workout elapsed time. The pill doubles as the pause control, since
 * that is the clock the user wants to stop.
 */
export default function SessionClock({ className }: { className?: string }) {
  const { status, elapsedMs } = useSessionClock();
  const pause = useSessionStore((s) => s.pause);
  const resume = useSessionStore((s) => s.resume);

  const paused = status === "paused";
  const active = status === "running" || paused;

  if (!active) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={(event) => {
        event.stopPropagation();
        if (paused) resume();
        else pause();
      }}
      aria-label={paused ? "Resume workout timer" : "Pause workout timer"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-semibold tabular-nums cursor-pointer ${
        paused
          ? "bg-background/60 border-border text-muted-foreground"
          : "bg-background/60 border-primary/40 text-foreground"
      } ${className ?? ""}`}
    >
      {paused ? (
        <Play size={12} fill="currentColor" className="text-primary" />
      ) : (
        <Pause size={12} fill="currentColor" className="text-primary" />
      )}
      {formatSessionTime(elapsedMs)}
    </motion.button>
  );
}
