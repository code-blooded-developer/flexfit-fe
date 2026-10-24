"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MoreVertical, ClipboardList, RefreshCw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Exercise, SectionKey } from "../_lib/workout-sections";

type Props = {
  exercise: Exercise;
  sectionKey: SectionKey;
  onLog: (sectionKey: SectionKey, exercise: Exercise) => void;
  onReplace: (sectionKey: SectionKey, exerciseId: string) => void;
  onDelete: (sectionKey: SectionKey, exerciseId: string) => void;
};

export default function ExerciseCard({
  exercise: ex,
  sectionKey,
  onLog,
  onReplace,
  onDelete,
}: Props) {
  const router = useRouter();

  const meta: { label: string; value: string }[] = [];
  if (ex.time) {
    meta.push({ label: "", value: ex.time });
  } else {
    if (ex.sets) meta.push({ label: "sets", value: String(ex.sets) });
    if (ex.reps) meta.push({ label: "reps", value: ex.reps });
  }
  if (ex.weight) meta.push({ label: "", value: ex.weight });

  const openFocus = () => router.push(`/exercise?exerciseId=${encodeURIComponent(ex.id)}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      role="button"
      tabIndex={0}
      onClick={openFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFocus();
        }
      }}
      className="rounded-2xl bg-card p-3 border border-border flex items-center gap-3 cursor-pointer active:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ex.gradient} flex items-center justify-center text-2xl shrink-0`}
      >
        {ex.image}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{ex.name}</p>
        <p className="text-[11px] text-primary mt-0.5">{ex.muscle}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
          {meta.map((m, i) => (
            <span key={i}>
              <strong className="text-foreground">{m.value}</strong>
              {m.label && ` ${m.label}`}
            </span>
          ))}
          {ex.logs.length > 0 && (
            <span className="flex items-center gap-1 text-primary">
              <ClipboardList size={11} /> {ex.logs.length}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={`Options for ${ex.name}`}
            className="p-2 -mr-1 rounded-lg active:bg-secondary text-muted-foreground cursor-pointer"
          >
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => onLog(sectionKey, ex)}>
            <ClipboardList size={14} className="mr-2" /> Add log
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onReplace(sectionKey, ex.id)}>
            <RefreshCw size={14} className="mr-2" /> Replace
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(sectionKey, ex.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={14} className="mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
