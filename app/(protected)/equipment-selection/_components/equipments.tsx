"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, ChevronRight, Sliders } from "lucide-react";

import { useEquipmentStore } from "@/store/equipmentStore";

import type { Equipment, EquipmentCategory } from "@/types/equipment";

type Props = {
  isLoading: boolean;
  filteredEquipments: Equipment[];
  query: string;
};

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  SMALL_WEIGHTS: "Small Weights",
  BARS_AND_PLATES: "Bars & Plates",
  BENCHES_AND_RACKS: "Benches & Racks",
  CABLE_MACHINES: "Cable Machines",
  RESISTANCE_BANDS: "Resistance Bands",
  PLATE_LOADED_MACHINES: "Plate Loaded Machines",
  WEIGHT_STACK_MACHINES: "Weight Stack Machines",
  ROPES_AND_SUSPENSION: "Ropes & Suspension",
  EXERCISE_BALLS_AND_CORE: "Exercise Balls & Core",
  CARDIO_MACHINES: "Cardio Machines",
  FUNCTIONAL_AND_STRONGMAN: "Functional & Strongman",
  MOBILITY_AND_RECOVERY: "Mobility & Recovery",
  AQUATIC: "Aquatic",
};

export function Equipments({ query, isLoading, filteredEquipments }: Props) {
  const selected = useEquipmentStore((s) => s.selected);
  const toggleItem = useEquipmentStore((s) => s.toggleItem);
  const getWeightEntries = useEquipmentStore((s) => s.getWeightEntries);
  const setEditing = useEquipmentStore((s) => s.setEditing);

  const grouped = useMemo(() => {
    const map: Record<string, Equipment[]> = {};
    for (const eq of filteredEquipments) {
      if (!map[eq.category]) map[eq.category] = [];
      map[eq.category].push(eq);
    }
    return map;
  }, [filteredEquipments]);

  if (isLoading) return null;

  return (
    <div className="px-6 pt-2 flex flex-col gap-6">
      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">
          No equipment matches &quot;{query}&quot;
        </p>
      )}

      {Object.entries(grouped).map(([category, equipments], sectionIndex) => (
        <motion.section
          key={category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * sectionIndex }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {CATEGORY_LABELS[category as EquipmentCategory] ?? category}
          </h2>

          <div className="flex flex-col rounded-2xl bg-card overflow-hidden divide-y divide-border/40">
            {equipments.map((item) => {
              const isOn = selected.has(item.id);
              const weightCount = getWeightEntries(item.id);

              return (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                    isOn ? "bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isOn ? "bg-primary/15" : "bg-secondary"
                    }`}
                  >
                    <Image
                      src="/equipments/Dumbbell.webp"
                      alt={item.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {item.name}
                    </p>

                    {item.hasVariants && isOn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(item);
                        }}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary font-medium"
                      >
                        <Sliders size={11} />
                        {weightCount} weight{weightCount === 1 ? "" : "s"}
                        <ChevronRight size={11} />
                      </button>
                    )}
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                      isOn
                        ? "bg-primary border-primary"
                        : "bg-transparent border-muted-foreground/40"
                    }`}
                  >
                    {isOn && (
                      <Check size={14} className="text-primary-foreground" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
