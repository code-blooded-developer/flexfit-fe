"use client";

import { useQuery } from "@tanstack/react-query";
import { equipmentService } from "@/services/equipmentService";

export function useUserEquipments() {
  return useQuery({
    queryKey: ["userEquipments"],
    queryFn: () => equipmentService.getUserEquipments(),
    retry: false,
  });
}
