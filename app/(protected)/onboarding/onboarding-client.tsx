"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

import { onboardingSteps, TOTAL_STEPS } from "./_constants/onboarding-steps";

import { OnboardingHeader } from "./_components/onboarding-header";
import { OptionStep } from "./_components/option-step";
import { ProfileStep } from "./_components/profile-step";

import { isProfileValid } from "./_lib/validation";

import type {
  ExperienceLevel,
  FitnessGoal,
  Gender,
  WorkoutEnvironment,
} from "@/types/auth";

import type { OnboardingPayload } from "@/types/onboarding";

import { useCompleteOnboarding } from "@/hooks/useCompleteOnboarding";

type Answers = {
  fitnessGoal: FitnessGoal | "";
  experienceLevel: ExperienceLevel | "";
  workoutEnvironment: WorkoutEnvironment | "";
  workoutDaysPerWeek: number | null;
  workoutDurationMinutes: number | null;
};

const INITIAL_ANSWERS: Answers = {
  fitnessGoal: "",
  experienceLevel: "",
  workoutEnvironment: "",
  workoutDaysPerWeek: null,
  workoutDurationMinutes: null,
};

export function OnboardingClient() {
  const router = useRouter();

  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);

  const [height, setHeight] = useState("");

  const [weight, setWeight] = useState("");

  const [gender, setGender] = useState<Gender | "">("");

  const { completeOnboarding, isLoading, error } = useCompleteOnboarding();

  const totalSteps = TOTAL_STEPS;

  const isProfileStep = step === onboardingSteps.length;

  const currentStep = onboardingSteps[step];

  useEffect(() => {
    if (isProfileStep) return;

    const currentValue = answers[currentStep.key];

    if (!currentValue) return;

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 280);

    return () => clearTimeout(timer);
  }, [answers, currentStep, isProfileStep]);

  const handleBack = () => {
    if (step === 0) {
      router.push("/auth");
      return;
    }

    setStep((prev) => prev - 1);
  };

  const handleSelect = (value: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isProfileValid({ height, weight, gender })) return;

    const payload: OnboardingPayload = {
      fitnessGoal: answers.fitnessGoal as FitnessGoal,

      experienceLevel: answers.experienceLevel as ExperienceLevel,

      workoutEnvironment: answers.workoutEnvironment as WorkoutEnvironment,

      workoutDaysPerWeek: answers.workoutDaysPerWeek as number,

      workoutDurationMinutes: answers.workoutDurationMinutes as number,

      height: Number(height),

      weight: Number(weight),

      gender: gender as Gender,
    };

    await completeOnboarding(payload);
  };

  return (
    <>
      {/* Background pulse */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(142 71% 45% / 0.05) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <OnboardingHeader
        currentStep={step}
        totalSteps={totalSteps}
        onBack={handleBack}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{
            opacity: 0,
            x: 40,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            x: -40,
            scale: 0.98,
          }}
          transition={{
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="flex-1 relative z-10"
        >
          {!isProfileStep ? (
            <OptionStep
              title={currentStep.title}
              subtitle={currentStep.subtitle}
              options={currentStep.options}
              selectedValue={answers[currentStep.key]}
              onSelect={handleSelect}
            />
          ) : (
            <ProfileStep
              height={height}
              weight={weight}
              gender={gender}
              onHeightChange={setHeight}
              onWeightChange={setWeight}
              onGenderChange={setGender}
              onSubmit={handleSubmit}
              loading={isLoading}
              error={error}
              canContinue={isProfileValid({ height, weight, gender })}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
