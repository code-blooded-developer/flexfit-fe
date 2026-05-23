"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useEquipments } from "@/hooks/useEquipments";
import { useEquipmentStore } from "@/store/equipmentStore";

import type { WorkoutEnvironment } from "@/types/auth";

import { AlertCircle } from "lucide-react";

import { Header } from "./_components/header";
import { Loader } from "./_components/loader";
import { Equipments } from "./_components/equipments";

function EquipmentSelectionContent() {
  const searchParams = useSearchParams();
  const environment = searchParams.get("environment") as WorkoutEnvironment;

  const { data, isPending, isError } = useEquipments(environment);

  const [query, setQuery] = useState("");

  const selected = useEquipmentStore((s) => s.selected);
  const initFromData = useEquipmentStore((s) => s.initFromData);

  useEffect(() => {
    if (data) {
      initFromData(data);
    }
  }, [data, initFromData]);

  const filteredEquipments = useMemo(() => {
    if (!query) return data ?? [];
    const q = query.toLowerCase();
    return (data ?? []).filter((eq) => eq.name.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <>
      <Header
        selectedCount={selected.size}
        environment={environment}
        query={query}
        setQuery={setQuery}
        isLoading={isPending}
      />
      <Loader isLoading={isPending} />

      {isError && (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
          <AlertCircle size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Failed to load equipments. Please try again.
          </p>
        </div>
      )}

      <Equipments
        query={query}
        isLoading={isPending}
        filteredEquipments={filteredEquipments}
      />
    </>
  );
}

export default function EquipmentSelectionPage() {
  return (
    <Suspense>
      <EquipmentSelectionContent />
    </Suspense>
  );
}
