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

export type Equipment = {
  id: string;
  name: string;
};

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
  equipments: Equipment[];
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
