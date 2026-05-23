"use client";

import { useSearchParams } from "next/navigation";
import { useEquipments } from "@/hooks/useEquipments";

import type { WorkoutEnvironment } from "@/types/auth";

export default function EquipmentSelectionPage() {
  const searchParams = useSearchParams();
  const environment = searchParams.get("environment") as WorkoutEnvironment;

  const { data, isLoading, isError } = useEquipments(environment);

  return (
    <div>
      <h1>Equipment Selection</h1>
      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading equipments.</p>}
      {data && (
        <ul>
          {data.map((equipment) => (
            <li key={equipment.id}>{equipment.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
