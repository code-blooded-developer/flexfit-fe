export type Role = "USER" | "ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type FitnessGoal =
  | "LOSE_WEIGHT"
  | "GAIN_MUSCLE"
  | "MAINTAIN_FITNESS"
  | "RECOMPOSITION";
export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type WorkoutEnvironment = "HOME" | "GYM" | "SOCIETY_GYM";
export type HeightUnit = "CM" | "FT";
export type WeightUnit = "KG" | "LB";
export type WorkoutSplit =
  | "FULL_BODY"
  | "UPPER_LOWER"
  | "PUSH_PULL_LEGS"
  | "BRO_SPLIT";

export type UserProfileResponse = {
  userId: string;
  name: string;
  gender: Gender | null;
  dateOfBirth: string | null;
  height: number | null;
  weight: number | null;
  fitnessGoal: FitnessGoal | null;
  experienceLevel: ExperienceLevel | null;
  workoutDaysPerWeek: number | null;
  workoutDurationMinutes: number | null;
  workoutEnvironment: WorkoutEnvironment | null;
  workoutSplit: WorkoutSplit | null;
  profileComplete: boolean;
};

export type UserResponse = {
  id: string;
  email: string;
  role: Role;
  isProfileComplete: boolean;
};

export type AuthResponse = {
  email: string;
  accessToken: string | null;
  refreshToken: string | null;
  role: Role;
  isProfileComplete: boolean;
  userProfile: UserProfileResponse | null;
};
