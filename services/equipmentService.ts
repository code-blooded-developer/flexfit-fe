import api from "@/lib/api";
import type { WorkoutEnvironment } from "@/types/auth";
import type { Equipment } from "@/types/equipment";

export const equipmentService = {
  getEquipment: (environment: WorkoutEnvironment) =>
    api.get<Equipment[]>(`/equipments?environment=${environment}`),
};
