/**
 * Exercise demo videos live in the public Supabase Storage bucket
 * `exercise-media`, keyed by the library exercise id (WorkoutExercise.exerciseId):
 *
 *   exercises/<exerciseId>/<videoKey>
 *
 * `videoKey` comes from the API (`WorkoutExercise.videoKey`) and is null until
 * a video has been uploaded, so the caller can skip the request entirely
 * instead of firing a 404 for every exercise that has no demo yet.
 *
 * The bucket is public, so the object URL needs no signing and no SDK.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = "exercise-media";

export function exerciseVideoUrl(
  exerciseId: string | null | undefined,
  videoKey: string | null | undefined,
) {
  if (!SUPABASE_URL || !exerciseId || !videoKey) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/exercises/${exerciseId}/${videoKey}`;
}
