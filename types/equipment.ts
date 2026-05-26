import { WeightUnit } from "./auth";

export type EquipmentType =
  | "BODYWEIGHT"
  | "FREE_WEIGHT"
  | "MACHINE"
  | "RESISTANCE"
  | "SUSPENSION"
  | "CARDIO_MACHINE"
  | "CARDIO_ACTIVITY"
  | "FUNCTIONAL"
  | "MOBILITY"
  | "AQUATIC";

export type EquipmentCategory =
  | "SMALL_WEIGHTS"
  | "BARS_AND_PLATES"
  | "BENCHES_AND_RACKS"
  | "CABLE_MACHINES"
  | "RESISTANCE_BANDS"
  | "PLATE_LOADED_MACHINES"
  | "WEIGHT_STACK_MACHINES"
  | "ROPES_AND_SUSPENSION"
  | "EXERCISE_BALLS_AND_CORE"
  | "CARDIO_MACHINES"
  | "FUNCTIONAL_AND_STRONGMAN"
  | "MOBILITY_AND_RECOVERY"
  | "AQUATIC";

export type EquipmentVariant = {
  id: string;
  weight: number;
  weightUnit: WeightUnit;
  quantity: number;
};

export type Equipment = {
  id: string;
  name: string;
  type: EquipmentType;
  category: EquipmentCategory;
  hasVariants: boolean;
  variants: EquipmentVariant[];
  selected: boolean;
  selectedVariantIds: string[];
};

export type VariantSelection = {
  variantId: string;
  quantity: number;
};

export type EquipmentSelection = {
  equipmentId: string;
  variantSelections: VariantSelection[];
};

export type SaveUserEquipmentPayload = {
  equipmentSelections: EquipmentSelection[];
};
