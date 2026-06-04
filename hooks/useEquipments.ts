"use client";

import { useQuery } from "@tanstack/react-query";

import { equipmentService } from "@/services/equipmentService";
import { normalizeError } from "@/lib/errorUtils";
import type { WorkoutEnvironment } from "@/types/auth";

export function useEquipments(environment: WorkoutEnvironment | null) {
  const query = useQuery({
    queryKey: ["equipments", environment],
    queryFn: () => equipmentService.getEquipment(environment!),
    enabled: !!environment,
    retry: false,
  });

  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error ? normalizeError(query.error) : null,
  };
}
