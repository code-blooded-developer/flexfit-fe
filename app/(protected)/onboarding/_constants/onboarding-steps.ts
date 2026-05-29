import {
  Flame,
  Dumbbell,
  Heart,
  Scale,
  Home,
  Building,
  Users,
} from "lucide-react";

import type { OnboardingStep } from "@/types/onboarding";
import type { WorkoutSplit } from "@/types/auth";

export const onboardingSteps: OnboardingStep[] = [
  {
    key: "fitnessGoal",
    title: "What's your goal?",
    subtitle: "We'll personalize your plan",
    options: [
      {
        label: "Lose Weight",
        value: "LOSE_WEIGHT",
        icon: Flame,
        emoji: "🔥",
      },
      {
        label: "Gain Muscle",
        value: "GAIN_MUSCLE",
        icon: Dumbbell,
        emoji: "💪",
      },
      {
        label: "Maintain Fitness",
        value: "MAINTAIN_FITNESS",
        icon: Heart,
        emoji: "❤️",
      },
      {
        label: "Recomposition",
        value: "RECOMPOSITION",
        icon: Scale,
        emoji: "🔄",
      },
    ],
  },
  {
    key: "experienceLevel",
    title: "Experience level?",
    subtitle: "This helps us set the right intensity",
    options: [
      {
        label: "Beginner",
        value: "BEGINNER",
        description: "New to working out",
      },
      {
        label: "Intermediate",
        value: "INTERMEDIATE",
        description: "1-3 years experience",
      },
      {
        label: "Advanced",
        value: "ADVANCED",
        description: "3+ years experience",
      },
    ],
  },
  {
    key: "workoutEnvironment",
    title: "Where do you train?",
    subtitle: "We'll tailor exercises accordingly",
    options: [
      {
        label: "Home",
        value: "HOME",
        icon: Home,
      },
      {
        label: "Gym",
        value: "GYM",
        icon: Building,
      },
      {
        label: "Society Gym",
        value: "SOCIETY_GYM",
        icon: Users,
      },
    ],
  },
  {
    key: "workoutDaysPerWeek",
    title: "Days per week?",
    subtitle: "How many days can you train",
    options: [
      {
        label: "2 days",
        value: 2,
      },
      {
        label: "3 days",
        value: 3,
      },
      {
        label: "4 days",
        value: 4,
      },
      {
        label: "5 days",
        value: 5,
      },
      {
        label: "6 days",
        value: 6,
      },
      {
        label: "7 days",
        value: 7,
      },
    ],
  },
  {
    key: "workoutDurationMinutes",
    title: "Workout duration?",
    subtitle: "Your preferred session length",
    options: [
      {
        label: "30 min",
        value: 30,
      },
      {
        label: "45 min",
        value: 45,
      },
      {
        label: "60 min",
        value: 60,
      },
      {
        label: "90 min",
        value: 90,
      },
      {
        label: "120 min",
        value: 120,
      },
    ],
  },
  {
    key: "workoutSplit",
    title: "Pick your split",
    subtitle: "Choose Your Training Style",
    options: [
      {
        label: "Full Body",
        value: "FULL_BODY",
        description:
          "Hit every major muscle group each session. Best for 3 days/week.",
      },
      {
        label: "Upper / Lower",
        value: "UPPER_LOWER",
        description:
          "Alternate upper and lower body days. Ideal for 4 days/week.",
      },
      {
        label: "Push / Pull / Legs",
        value: "PUSH_PULL_LEGS",
        description:
          "Group muscles by movement pattern. Great for 5–6 days/week.",
      },
      {
        label: "Bro Split",
        value: "BRO_SPLIT",
        description:
          "One muscle group per day. High volume, requires 5–6 days/week.",
      },
    ],
  },
] as const;

export const RECOMMENDED_SPLITS: Record<number, WorkoutSplit[]> = {
  2: ["FULL_BODY", "UPPER_LOWER"],
  3: ["FULL_BODY", "PUSH_PULL_LEGS"],
  4: ["UPPER_LOWER", "PUSH_PULL_LEGS"],
  5: ["PUSH_PULL_LEGS", "BRO_SPLIT"],
  6: ["PUSH_PULL_LEGS"],
  7: ["PUSH_PULL_LEGS"],
};

export const TOTAL_STEPS = onboardingSteps.length + 1;
