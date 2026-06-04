"use client";

import { useQuery } from "@tanstack/react-query";

import { equipmentService } from "@/services/equipmentService";
import { normalizeError } from "@/lib/errorUtils";

export function useUserEquipments() {
  const query = useQuery({
    queryKey: ["userEquipments"],
    queryFn: () => equipmentService.getUserEquipments(),
    retry: false,
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    error: query.error ? normalizeError(query.error) : null,
  };
}
