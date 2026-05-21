import type { ProfileAnswers } from "@/types/onboarding";

export type ProfileErrors = {
  height?: string;
  weight?: string;
  gender?: string;
  dateOfBirth?: string;
};

export function validateProfile(profile: ProfileAnswers): {
  isValid: boolean;
  errors: ProfileErrors;
} {
  const errors: ProfileErrors = {};
  const heightUnit = profile.heightUnit ?? "CM";
  const weightUnit = profile.weightUnit ?? "KG";

  const height = Number(profile.height);
  if (!profile.height) {
    errors.height = "Height is required";
  } else if (heightUnit === "CM") {
    if (height < 100 || height > 250) {
      errors.height = "Height must be between 100-250 cm";
    }
  } else {
    if (height < 3.3 || height > 8.2) {
      errors.height = "Height must be between 3.3-8.2 ft";
    }
  }

  const weight = Number(profile.weight);
  if (!profile.weight) {
    errors.weight = "Weight is required";
  } else if (weightUnit === "KG") {
    if (weight < 30 || weight > 300) {
      errors.weight = "Weight must be between 30-300 kg";
    }
  } else {
    if (weight < 66 || weight > 661) {
      errors.weight = "Weight must be between 66-661 lb";
    }
  }

  if (!profile.gender) {
    errors.gender = "Gender is required";
  }

  const dob = profile.dateOfBirth;
  if (!dob) {
    errors.dateOfBirth = "Date of birth is required";
  } else {
    const birthDate = new Date(dob);
    const today = new Date();
    if (birthDate >= today) {
      errors.dateOfBirth = "Date of birth must be in the past";
    } else {
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.dateOfBirth = "You must be at least 13 years old";
      } else if (age > 120) {
        errors.dateOfBirth = "Please enter a valid date";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
