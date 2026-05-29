"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { onboardingSteps, TOTAL_STEPS, RECOMMENDED_SPLITS } from "./_constants/onboarding-steps";

import { OnboardingHeader } from "./_components/onboarding-header";
import { OptionStep } from "./_components/option-step";
import { ProfileStep } from "./_components/profile-step";

import { validateProfile, type ProfileErrors } from "./_lib/validation";
import { buildPayload } from "./_lib/build-payload";

import type {
  ExperienceLevel,
  FitnessGoal,
  Gender,
  WorkoutEnvironment,
  HeightUnit,
  WeightUnit,
  WorkoutSplit,
} from "@/types/auth";

import { useCompleteOnboarding } from "@/hooks/useCompleteOnboarding";

type Answers = {
  fitnessGoal: FitnessGoal | "";
  experienceLevel: ExperienceLevel | "";
  workoutEnvironment: WorkoutEnvironment | "";
  workoutDaysPerWeek: number | null;
  workoutDurationMinutes: number | null;
  workoutSplit: WorkoutSplit | "";
};

const INITIAL_ANSWERS: Answers = {
  fitnessGoal: "",
  experienceLevel: "",
  workoutEnvironment: "",
  workoutDaysPerWeek: null,
  workoutDurationMinutes: null,
  workoutSplit: "",
};

export function OnboardingClient() {
  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);

  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("CM");

  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("KG");

  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  const prevStepRef = useRef<number>(step);

  const { completeOnboarding, isLoading, error } = useCompleteOnboarding();

  const totalSteps = TOTAL_STEPS;

  const isProfileStep = step === onboardingSteps.length;

  const currentStep = onboardingSteps[step];

  useEffect(() => {
    if (isProfileStep) return;

    const isGoingBack = step < prevStepRef.current;
    if (isGoingBack) {
      prevStepRef.current = step;
      return;
    }

    prevStepRef.current = step;

    const currentValue = answers[currentStep.key];

    if (!currentValue) return;

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 280);

    return () => clearTimeout(timer);
  }, [answers, currentStep, isProfileStep, step]);

  const handleBack = () => {
    if (step === 0) {
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
    const { isValid, errors } = validateProfile({
      height,
      weight,
      gender,
      dateOfBirth,
      heightUnit,
      weightUnit,
    });

    if (!isValid) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});

    const onboardingAnswers = {
      fitnessGoal: answers.fitnessGoal,
      experienceLevel: answers.experienceLevel,
      workoutEnvironment: answers.workoutEnvironment,
      workoutDaysPerWeek: String(answers.workoutDaysPerWeek ?? ""),
      workoutDurationMinutes: String(answers.workoutDurationMinutes ?? ""),
      workoutSplit: answers.workoutSplit,
    };

    const profile = {
      height,
      heightUnit,
      weight,
      weightUnit,
      gender,
      dateOfBirth,
    };

    const payload = buildPayload(onboardingAnswers, profile);

    await completeOnboarding(payload);
  };

  const clearProfileError = (field: keyof ProfileErrors) => {
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
              getBadge={(value) =>
                answers.workoutDaysPerWeek &&
                RECOMMENDED_SPLITS[answers.workoutDaysPerWeek]?.includes(value as WorkoutSplit)
                  ? "Recommended"
                  : null
              }
            />
          ) : (
            <ProfileStep
              height={height}
              weight={weight}
              gender={gender}
              heightUnit={heightUnit}
              weightUnit={weightUnit}
              dateOfBirth={dateOfBirth}
              errors={profileErrors}
              onHeightChange={(v) => {
                setHeight(v);
                clearProfileError("height");
              }}
              onWeightChange={(v) => {
                setWeight(v);
                clearProfileError("weight");
              }}
              onGenderChange={(v) => {
                setGender(v);
                clearProfileError("gender");
              }}
              onHeightUnitChange={(v) => {
                setHeightUnit(v);
                clearProfileError("height");
              }}
              onWeightUnitChange={(v) => {
                setWeightUnit(v);
                clearProfileError("weight");
              }}
              onDateOfBirthChange={(v) => {
                setDateOfBirth(v);
                clearProfileError("dateOfBirth");
              }}
              onSubmit={handleSubmit}
              loading={isLoading}
              error={error}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
