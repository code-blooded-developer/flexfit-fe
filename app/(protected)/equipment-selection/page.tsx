"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import { ChevronRight } from "lucide-react";

import { useEquipments } from "@/hooks/useEquipments";
import { useEquipmentStore } from "@/store/equipmentStore";
import { useUserProfile } from "@/hooks/useUserProfile";

import type { WorkoutEnvironment } from "@/types/auth";

import { AlertCircle } from "lucide-react";

import { Header } from "./_components/header";
import { Loader } from "./_components/loader";
import { Equipments } from "./_components/equipments";
import { VariantEditor } from "./_components/variant-editor";

function EquipmentSelectionContent() {
  const router = useRouter();

  const { profile, isLoading: profileLoading } = useUserProfile();

  const environment = (profile?.workoutEnvironment ?? null) as WorkoutEnvironment | null;

  useEffect(() => {
    if (profileLoading) return;
    if (!environment) {
      router.push("/onboarding");
    }
  }, [environment, profileLoading, router]);

  const { data, isPending, isError } = useEquipments(environment);

  const [query, setQuery] = useState("");

  const selected = useEquipmentStore((s) => s.selected);
  const initFromData = useEquipmentStore((s) => s.initFromData);

  const selectedCount = selected.size;

  const handleContinue = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

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

  if (!environment) {
    return <Loader isLoading={true} />;
  }

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

      <VariantEditor />

      <div className="fixed bottom-0 left-0 right-0 px-6 pt-4 pb-8 bg-gradient-to-t from-background via-background to-transparent z-20">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          disabled={selectedCount === 0}
          className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base transition-all ${
            selectedCount > 0
              ? "bg-primary text-primary-foreground glow-primary-intense"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Continue
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </>
  );
}

export default function EquipmentSelectionPage() {
  return <EquipmentSelectionContent />;
}
