import { create } from "zustand";

import type { Equipment } from "@/types/equipment";

type EquipmentStore = {
  selected: Set<string>;
  selectedVariantIds: Record<string, string[]>;
  editing: Equipment | null;

  toggleItem: (id: string) => void;
  getWeightEntries: (id: string) => number;
  setEditing: (equipment: Equipment | null) => void;
  initFromData: (equipments: Equipment[]) => void;
};

export const useEquipmentStore = create<EquipmentStore>((set, get) => ({
  selected: new Set<string>(),
  selectedVariantIds: {},
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

  getWeightEntries: (id: string) => {
    const ids = get().selectedVariantIds[id];
    return ids ? ids.length : 0;
  },

  setEditing: (equipment: Equipment | null) => {
    set({ editing: equipment });
  },

  initFromData: (equipments: Equipment[]) => {
    const selected = new Set<string>();
    const selectedVariantIds: Record<string, string[]> = {};

    for (const eq of equipments) {
      if (eq.selected) {
        selected.add(eq.id);
      }
      if (eq.selectedVariantIds.length > 0) {
        selectedVariantIds[eq.id] = eq.selectedVariantIds;
      }
    }

    set({ selected, selectedVariantIds });
  },
}));
