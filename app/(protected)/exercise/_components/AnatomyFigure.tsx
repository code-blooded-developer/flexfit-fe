"use client";

import { useMemo } from "react";
import Model from "react-body-highlighter";
import type { IExerciseData, Muscle } from "react-body-highlighter";

import { cn } from "@/lib/utils";
import type { MuscleGroup } from "@/types/workout";

/**
 * Which polygons of the body model light up for each muscle group.
 * The library has separate front and back muscles, so a group can appear on
 * one view, the other, or both.
 */
const MUSCLE_PARTS: Record<MuscleGroup, { front: Muscle[]; back: Muscle[] }> = {
  CHEST: { front: ["chest"], back: [] },
  BACK: { front: [], back: ["upper-back", "trapezius"] },
  // The delt wraps around the shoulder, so it shows on both views.
  SHOULDERS: { front: ["front-deltoids"], back: ["back-deltoids"] },
  BICEPS: { front: ["biceps"], back: [] },
  TRICEPS: { front: [], back: ["triceps"] },
  CORE: { front: ["abs", "obliques"], back: [] },
  LEGS: { front: ["quadriceps"], back: [] },
  HAMSTRINGS: { front: [], back: ["hamstring"] },
  GLUTES: { front: [], back: ["gluteal"] },
  CALVES: { front: ["calves"], back: ["calves"] },
  FULL_BODY: {
    front: ["chest", "abs", "obliques", "quadriceps", "front-deltoids"],
    back: ["upper-back", "trapezius", "gluteal", "hamstring", "triceps"],
  },
};

// Indexed by frequency: index 0 = frequency 1 (secondary), index 1 = frequency 2.
// Both must be opaque: the library draws the body as the same polygons, so a
// translucent muscle would composite against the video, not the body.
const HIGHLIGHTED_COLORS = ["#2c9653", "hsl(var(--primary))"];

const BODY_COLOR = "#aeb5bc";

type Sides = {
  front: { primary: Muscle[]; secondary: Muscle[] };
  back: { primary: Muscle[]; secondary: Muscle[] };
};

function resolveSides(primary: MuscleGroup, secondary: MuscleGroup[]): Sides {
  const sides: Sides = {
    front: { primary: [], secondary: [] },
    back: { primary: [], secondary: [] },
  };

  const collect = (group: MuscleGroup, bucket: "primary" | "secondary") => {
    const parts = MUSCLE_PARTS[group];
    if (!parts) return;
    sides.front[bucket].push(...parts.front);
    sides.back[bucket].push(...parts.back);
  };

  collect(primary, "primary");
  secondary.forEach((group) => collect(group, "secondary"));

  // A muscle that is both primary and secondary stays primary.
  for (const side of [sides.front, sides.back]) {
    const primaries = new Set(side.primary);
    side.secondary = side.secondary.filter((muscle) => !primaries.has(muscle));
  }

  return sides;
}

function toData(primary: Muscle[], secondary: Muscle[]): IExerciseData[] {
  const data: IExerciseData[] = [];
  if (secondary.length) {
    data.push({ name: "secondary", muscles: secondary, frequency: 1 });
  }
  if (primary.length) {
    data.push({ name: "primary", muscles: primary, frequency: 2 });
  }
  return data;
}

type Props = {
  primary: MuscleGroup;
  secondary?: MuscleGroup[];
  className?: string;
};

/**
 * Front/back body model with the worked muscles highlighted.
 * Only the views that actually have something lit are rendered, so a one-sided
 * exercise shows a single centred figure instead of an empty second body.
 */
export default function AnatomyFigure({ primary, secondary = [], className }: Props) {
  const { front, back } = useMemo(
    () => resolveSides(primary, secondary),
    [primary, secondary],
  );

  const showFront = front.primary.length > 0 || front.secondary.length > 0;
  const showBack = back.primary.length > 0 || back.secondary.length > 0;
  // Unknown muscle group: fall back to a plain front body rather than nothing.
  const fallback = !showFront && !showBack;

  return (
    <div
      aria-hidden="true"
      className={cn("anatomy-figure flex items-center justify-center gap-10", className)}
    >
      {(showFront || fallback) && (
        <Model
          type="anterior"
          data={toData(front.primary, front.secondary)}
          highlightedColors={HIGHLIGHTED_COLORS}
          bodyColor={BODY_COLOR}
          style={{ width: "7rem", height: "14rem" }}
          svgStyle={{ filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.55))" }}
        />
      )}
      {showBack && (
        <Model
          type="posterior"
          data={toData(back.primary, back.secondary)}
          highlightedColors={HIGHLIGHTED_COLORS}
          bodyColor={BODY_COLOR}
          style={{ width: "7rem", height: "14rem" }}
          svgStyle={{ filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.55))" }}
        />
      )}
    </div>
  );
}
