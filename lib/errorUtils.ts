import { ApiError } from "./apiError";

export function normalizeError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) {
    return err.message;
  }

  return fallback;
}
