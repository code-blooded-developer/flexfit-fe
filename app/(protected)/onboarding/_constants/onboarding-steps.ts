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
        value: "GYM",
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
    ],
  },
] as const;

export const TOTAL_STEPS = onboardingSteps.length + 1;
