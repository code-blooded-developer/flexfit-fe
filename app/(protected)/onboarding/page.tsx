"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OnboardingClient } from "./onboarding-client";

export default function OnboardingPage() {
  const { profile, isLoading, isError } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isError) return;

    if (profile?.profileComplete) {
      router.push("/dashboard");
    }
  }, [profile, isLoading, isError, router]);

  if (isLoading || isError || profile?.profileComplete) {
    return null;
  }

  return <OnboardingClient />;
}
