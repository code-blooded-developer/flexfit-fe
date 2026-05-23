"use client";

import { useQuery } from "@tanstack/react-query";
import { equipmentService } from "@/services/equipmentService";
import { WorkoutEnvironment } from "@/types/auth";

export function useEquipments(environment: WorkoutEnvironment) {
  return useQuery({
    queryKey: ["equipments", environment],
    queryFn: () => equipmentService.getEquipment(environment!),
    enabled: !!environment,
    retry: false,
  });
}
