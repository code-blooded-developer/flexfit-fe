"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Minus, Plus } from "lucide-react";

import { useEquipmentStore } from "@/store/equipmentStore";

import type { WeightUnit } from "@/types/auth";

const kgToLb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;

const formatWeight = (kg: number, unit: WeightUnit) =>
  unit === "KG" ? `${kg} kg` : `${kgToLb(kg)} lb`;

export function VariantEditor() {
  const editing = useEquipmentStore((s) => s.editing);
  const selectedVariantIds = useEquipmentStore((s) => s.selectedVariantIds);
  const setEditing = useEquipmentStore((s) => s.setEditing);
  const toggleVariant = useEquipmentStore((s) => s.toggleVariant);
  const setVariants = useEquipmentStore((s) => s.setVariants);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("KG");

  if (!editing) return null;

  const variantIds = selectedVariantIds[editing.id] ?? [];
  const allVariantIds = editing.variants.map((v) => v.id);
  const allSelected = allVariantIds.every((id) => variantIds.includes(id));

  const clearAllWeights = () => setVariants(editing.id, []);
  const toggleAllWeights = () =>
    setVariants(editing.id, allSelected ? [] : allVariantIds);

  return (
    <AnimatePresence>
      {editing && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(null)}
            className="fixed inset-0 bg-black/60 z-30"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-card rounded-t-3xl px-6 pt-4 pb-8 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 rounded-full bg-secondary mx-auto mb-4" />
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-xl font-bold font-display text-foreground">
                  {editing.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pick the weights you have available
                </p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary text-foreground"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Unit toggle + Select all */}
            <div className="flex items-center justify-between mt-4 mb-4">
              <div className="flex gap-1 p-1 rounded-xl bg-secondary">
                {(["KG", "LB"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setWeightUnit(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      weightUnit === u
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {u.toLowerCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearAllWeights}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-muted-foreground"
                >
                  Clear
                </button>
                <button
                  onClick={toggleAllWeights}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/15 text-primary"
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {editing.variants.map((variant) => {
                const isSelected = variantIds.includes(variant.id);
                return (
                  <div
                    key={variant.id}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 border-2 transition-all ${
                      isSelected
                        ? "bg-primary/5 border-primary/30"
                        : "bg-secondary border-transparent"
                    }`}
                  >
                    <div className="text-sm font-semibold text-foreground">
                      {formatWeight(variant.weight, weightUnit)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (isSelected)
                            toggleVariant(editing.id, variant.id);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-background text-foreground"
                        aria-label="Remove"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold text-primary">
                        {isSelected ? 1 : 0}
                      </span>
                      <button
                        onClick={() => {
                          if (!isSelected)
                            toggleVariant(editing.id, variant.id);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-primary-foreground"
                        aria-label="Add"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setEditing(null)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold"
            >
              Done
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
