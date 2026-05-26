"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { equipmentService } from "@/services/equipmentService";

import { ApiError } from "@/lib/apiError";

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
      if (err instanceof ApiError) {
        throw new Error(err.message);
      }

      throw new Error("Something went wrong. Please try again.");
    }
  };

  return {
    saveEquipment,
    isLoading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}
