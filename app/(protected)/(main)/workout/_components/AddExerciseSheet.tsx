"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import type { ExerciseType, SectionKey } from "../_lib/workout-sections";
import { pickGradient } from "../_lib/workout-sections";

const emojiPool = ["🏋️", "💪", "🤸", "🦵", "🧘", "🏃", "🤾", "🚴", "🧎", "💫", "🔥", "⚡"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionKey: SectionKey | null;
  sectionTitle: string;
  onSubmit: (data: { name: string; muscle: string; type: ExerciseType; emoji: string }) => void;
};

export default function AddExerciseSheet({ open, onOpenChange, sectionKey: _, sectionTitle, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [type, setType] = useState<ExerciseType>("strength");
  const [emoji, setEmoji] = useState("🏋️");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), muscle: muscle.trim() || "Custom", type, emoji });
    setName("");
    setMuscle("");
    setType("strength");
    setEmoji("🏋️");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onOpenChange(false); }}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border bg-background max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display">Add custom exercise</SheetTitle>
          <SheetDescription>Add a new exercise to this section.</SheetDescription>
        </SheetHeader>
        <div className="mt-5 flex flex-col gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pickGradient(name || "x")} flex items-center justify-center text-3xl shrink-0`}
            >
              {emoji}
            </div>
            <div className="flex-1 flex flex-wrap gap-1.5">
              {emojiPool.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
                    emoji === e ? "bg-primary/20 ring-1 ring-primary" : "bg-secondary"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Exercise name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goblet Squat" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Target / muscle</label>
            <Input value={muscle} onChange={(e) => setMuscle(e.target.value)} placeholder="e.g. Quads" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex gap-2">
              {(["strength", "cardio", "mobility"] as ExerciseType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                    type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!name.trim()}
            onClick={handleSubmit}
            className="mt-2 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40"
          >
            Add to {sectionTitle}
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
