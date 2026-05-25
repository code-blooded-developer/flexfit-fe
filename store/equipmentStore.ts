import { create } from "zustand";

import type { Equipment } from "@/types/equipment";

type EquipmentStore = {
  selected: Set<string>;
  variantQuantities: Record<string, Record<string, number>>;
  editing: Equipment | null;

  toggleItem: (id: string) => void;
  setVariantQuantity: (equipmentId: string, variantId: string, quantity: number) => void;
  setVariants: (equipmentId: string, variantIds: string[]) => void;
  getWeightEntries: (id: string) => number;
  setEditing: (equipment: Equipment | null) => void;
  initFromData: (equipments: Equipment[]) => void;
};

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  selected: new Set<string>(),
  variantQuantities: {},
  editing: null,

  toggleItem: (id: string) => {
    set((state) => {
      const next = new Set(state.selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selected: next };
    });
  },

  setVariantQuantity: (equipmentId: string, variantId: string, quantity: number) => {
    set((state) => {
      const current = state.variantQuantities[equipmentId] ?? {};
      const next = { ...current, [variantId]: quantity };
      return {
        variantQuantities: {
          ...state.variantQuantities,
          [equipmentId]: next,
        },
      };
    });
  },

  setVariants: (equipmentId: string, variantIds: string[]) => {
    set((state) => {
      const editing = get().editing;
      const variants = editing?.variants ?? [];
      const next: Record<string, number> = {};
      for (const vid of variantIds) {
        const v = variants.find((x) => x.id === vid);
        next[vid] = v?.quantity ?? 1;
      }
      return {
        variantQuantities: {
          ...state.variantQuantities,
          [equipmentId]: next,
        },
      };
    });
  },

  getWeightEntries: (id: string) => {
    const qmap = get().variantQuantities[id];
    if (!qmap) return 0;
    return Object.values(qmap).reduce((sum, q) => sum + q, 0);
  },

  setEditing: (equipment: Equipment | null) => {
    set({ editing: equipment });
  },

  initFromData: (equipments: Equipment[]) => {
    const selected = new Set<string>();
    const variantQuantities: Record<string, Record<string, number>> = {};

    for (const eq of equipments) {
      if (eq.selected) {
        selected.add(eq.id);
      }
      if (eq.selectedVariantIds.length > 0) {
        const quantities: Record<string, number> = {};
        for (const vid of eq.selectedVariantIds) {
          const variant = eq.variants.find((v) => v.id === vid);
          quantities[vid] = variant?.quantity ?? 1;
        }
        variantQuantities[eq.id] = quantities;
      }
    }

    set({ selected, variantQuantities });
  },
}));
