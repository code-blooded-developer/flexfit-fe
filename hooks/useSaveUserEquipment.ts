"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { equipmentService } from "@/services/equipmentService";

import { normalizeError } from "@/lib/errorUtils";

import type { SaveUserEquipmentPayload } from "@/types/equipment";

export function useSaveUserEquipment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SaveUserEquipmentPayload) =>
      equipmentService.saveUserEquipment(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipments"] });
      router.push("/dashboard");
    },
  });

  const saveEquipment = async (payload: SaveUserEquipmentPayload) => {
    try {
      await mutation.mutateAsync(payload);
    } catch (err) {
      throw new Error(normalizeError(err));
    }
  };

  return {
    saveEquipment,
    isLoading: mutation.isPending,
    error: mutation.error ? normalizeError(mutation.error) : null,
  };
}
