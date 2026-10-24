/**
 * Exercise demo videos live in the public Supabase Storage bucket
 * `exercise-media`, keyed by the library exercise id (WorkoutExercise.exerciseId):
 *
 *   exercises/<exerciseId>/video-v1.mp4
 *
 * The bucket is public, so the object URL needs no signing and no SDK.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET = "exercise-media";
const VIDEO_FILE = "video-v1.mp4";

export function exerciseVideoUrl(exerciseId: string | null | undefined) {
  if (!SUPABASE_URL || !exerciseId) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/exercises/${exerciseId}/${VIDEO_FILE}`;
}
