"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import type { Exercise, SectionKey } from "../_lib/workout-sections";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logging: { section: SectionKey; exercise: Exercise } | null;
  onSubmit: (section: SectionKey, exerciseId: string, data: {
    weight?: string;
    reps?: string;
    time?: string;
    distance?: string;
    notes?: string;
  }) => void;
  onDeleteLog: (section: SectionKey, exerciseId: string, logId: string) => void;
};

export default function LogSetSheet({ open, onOpenChange, logging, onSubmit, onDeleteLog }: Props) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!logging) return;
    onSubmit(logging.section, logging.exercise.id, { weight, reps, time, distance, notes });
    setWeight("");
    setReps("");
    setTime("");
    setDistance("");
    setNotes("");
    onOpenChange(false);
  };

  const exercise = logging?.exercise;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border bg-background max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display">Log {exercise?.name}</SheetTitle>
          <SheetDescription>Record your performance.</SheetDescription>
        </SheetHeader>
        <div className="mt-5 flex flex-col gap-3 pb-4">
          {exercise?.type === "cardio" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Time</label>
                <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 20 min" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Distance</label>
                <Input value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g. 3 km" />
              </div>
            </div>
          ) : exercise?.type === "mobility" ? (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Time / reps</label>
              <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 60 s or 15 reps" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Weight</label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 60 kg" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Reps</label>
                <Input value={reps} onChange={(e) => setReps(e.target.value)} placeholder="e.g. 10" />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </div>

          {exercise && exercise.logs.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-2">Previous logs</p>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {exercise.logs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-secondary text-xs">
                    <span className="text-foreground truncate">
                      {[l.weight, l.reps && `× ${l.reps}`, l.time, l.distance, l.notes].filter(Boolean).join(" · ")}
                    </span>
                    <button
                      onClick={() => onDeleteLog(logging!.section, logging!.exercise.id, l.id)}
                      className="text-muted-foreground shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="mt-3 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold"
          >
            Save log
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
