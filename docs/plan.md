# FlexFit — Decouple Exercise Videos from Database IDs

**Status:** Proposed  
**Repos:** `flexfit-be`, `flexfit-fe`  
**Goal:** Store exercise demo videos under a stable, environment-independent key so each environment can use its own database without breaking or duplicating media.

---

## 1. Problem

Today the storage path is derived from the database primary key:

```text
exercises.id (random UUID generated independently in every DB)
  -> exercise-media/exercises/<exerciseId>/video-v1.mp4
  -> exercises.video_key stores only the object name
  -> the frontend hardcodes the Supabase bucket and path
```

Each environment seeds the same exercises, but Hibernate generates a different UUID for each row. Therefore the bucket path is only valid for the database that existed when the video was uploaded. Separate databases per environment either require re-uploading every video or leave most environments with broken URLs.

The problem is not that media metadata lives in the database. The problem is that the media identity is derived from a database-generated value.

---

## 2. Decisions

These are the agreed decisions for this implementation:

1. Add a unique, immutable `slug` to `exercises`.
2. Keep the UUID primary key and all existing foreign keys. `slug` is a business/storage key, not the primary key.
3. Keep `video_key` as a nullable presence flag. When a video exists it is normally the constant `video-v1.mp4`.
4. Do **not** add `video_path`.
5. Store objects at:

   ```text
   exercise-media/exercises/<slug>/<video_key>
   ```

   Example:

   ```text
   exercise-media/exercises/barbell-bench-press/video-v1.mp4
   ```

6. Return a computed `videoUrl` from the API so the frontend does not build storage URLs or know which provider/bucket is used.
7. Keep exercise demo videos in one shared, public catalog bucket used by all environments. Each environment has its own database.
8. Do not change workout or exercise UUIDs, foreign keys, or user data.

### Non-goals

- Multiple videos per exercise.
- Private or user-uploaded videos.
- Video transcoding or adaptive bitrate.
- Replacing Supabase Storage with a CDN/video platform.
- Changing the workout generation logic.

These can be added later without changing the slug-based storage layout.

---

## 3. Target Design

### Database

```sql
exercises
  id           uuid primary key          -- unchanged
  name         varchar unique            -- unchanged
  slug         varchar(160) unique       -- new, immutable
  video_key    varchar                   -- null, or "video-v1.mp4"
  thumbnail_key varchar                  -- unchanged, optional
```

`slug` examples:

```text
Push Up              -> push-up
Bench Press          -> bench-press
Barbell Bench Press  -> barbell-bench-press
Farmer's Walk        -> farmers-walk
```

Rules:

- Lowercase ASCII.
- Allowed format: `[a-z0-9]+(-[a-z0-9]+)*`.
- Maximum 160 characters.
- Assigned once and never regenerated from the name later.
- Explicit overrides allowed for collisions.

### Object layout

```text
exercise-media/
  exercises/
    push-up/
      video-v1.mp4
    barbell-bench-press/
      video-v1.mp4
```

No environment name or UUID is part of the path. The same object works in every environment.

### API response

Add `slug` and a computed `videoUrl`:

```json
{
  "id": "…",
  "slug": "barbell-bench-press",
  "videoKey": "video-v1.mp4",
  "videoUrl": "https://<project>.supabase.co/storage/v1/object/public/exercise-media/exercises/barbell-bench-press/video-v1.mp4"
}
```

`videoUrl` is `null` when `slug`, `videoKey`, or `MEDIA_PUBLIC_BASE_URL` is missing.

Keep `videoKey` in the response during the transition. Remove it later only after the frontend no longer uses it.

### Environment model

- **Exercise demos:** one shared public catalog bucket, read by local/staging/prod.
- **Application data:** one database per environment, as desired.
- **Future user-generated media:** separate table and separate per-environment bucket. Do not mix it with the exercise catalog.

If strict storage isolation is required later, create one bucket per environment with identical object keys. Because the path contains only `slug` + `video_key`, no database or frontend changes are needed.

---

## 4. Backend Implementation

### 4.1 Add `slug` to the entity

File: `flexfit-be/src/main/java/com/harish/flexfit/entity/Exercise.java`

Add:

```java
@Column(name = "slug", unique = true, length = 160)
private String slug;
```

Do not mark it `nullable = false` until existing rows are backfilled.

Do not add a `videoPath` field.

### 4.2 Generate and backfill slugs

File: `flexfit-be/src/main/java/com/harish/flexfit/seeder/ExerciseSeeder.java`

- Add a slug utility, either in `util/` or as a private method in the seeder:

  ```text
  lowercase -> replace & with " and " -> remove apostrophes
  -> replace non-alphanumeric runs with "-" -> trim "-"
  ```

- Set the slug when creating a new `Exercise`.
- In the existing upsert loop:
  - If the existing row has no slug, assign one.
  - If it already has a slug, leave it unchanged.
  - Never overwrite a slug when the exercise name changes.
- Detect duplicate slugs before saving and fail with a clear message telling the developer to add an explicit override.
- Keep the existing upsert-by-name behavior for this change. Once all rows have slugs, upserting by slug is preferable, but it is not required for the first migration.

Suggested override mechanism:

```java
private static final Map<String, String> SLUG_OVERRIDES = Map.of(
    // "Exercise Name", "explicit-slug"
);
```

### 4.3 Add media URL configuration

New file: `flexfit-be/src/main/java/com/harish/flexfit/config/MediaProperties.java`

```java
@ConfigurationProperties(prefix = "app.media")
@Getter
@Setter
public class MediaProperties {
    private String baseUrl = "";

    public String publicUrl(String objectPath) {
        if (baseUrl == null || baseUrl.isBlank() || objectPath == null || objectPath.isBlank()) {
            return null;
        }
        return baseUrl.replaceAll("/+$", "") + "/" + objectPath.replaceAll("^/+", "");
    }
}
```

Register it in `Application.java` with `@ConfigurationPropertiesScan` (or `@EnableConfigurationProperties(MediaProperties.class)`).

File: `flexfit-be/src/main/resources/application.properties`

```properties
app.media.base-url=${MEDIA_PUBLIC_BASE_URL:}
```

File: `flexfit-be/.env`

```env
MEDIA_PUBLIC_BASE_URL=https://<project>.supabase.co/storage/v1/object/public/exercise-media
```

`MEDIA_PUBLIC_BASE_URL` is public and contains no secret. The service-role key remains only for uploads.

### 4.4 Add `slug` and `videoUrl` to response DTOs

Files:

- `flexfit-be/src/main/java/com/harish/flexfit/dto/response/ExerciseResponse.java`
- `flexfit-be/src/main/java/com/harish/flexfit/dto/response/WorkoutExerciseResponse.java`

Add:

```java
private String slug;
private String videoUrl;
```

Keep `videoKey` and `thumbnailKey` for now.

### 4.5 Populate the new fields

Files:

- `flexfit-be/src/main/java/com/harish/flexfit/service/impl/ExerciseServiceImpl.java`
- `flexfit-be/src/main/java/com/harish/flexfit/service/impl/WorkoutServiceImpl.java`

Inject `MediaProperties` and add a small helper, for example:

```java
private String videoUrl(Exercise exercise) {
    if (exercise.getSlug() == null || exercise.getVideoKey() == null) {
        return null;
    }
    return mediaProperties.publicUrl(
        "exercises/" + exercise.getSlug() + "/" + exercise.getVideoKey());
}
```

Populate `.slug(...)` and `.videoUrl(...)` in:

- `ExerciseServiceImpl.map(...)`
- `WorkoutServiceImpl` alternative-exercise builder (around the `WorkoutExerciseResponse.builder()` near line 308)
- `WorkoutServiceImpl` workout-exercise mapper (around the builder near line 925)

If thumbnails are added later, use the same pattern with `exercises/<slug>/<thumbnailKey>`; no schema change is required.

### 4.6 Database migration SQL

Because the project currently relies on `spring.jpa.hibernate.ddl-auto`, use an explicit SQL migration for existing environments. Hibernate creates the nullable column; these statements backfill/enforce the constraints.

Preflight:

```sql
-- Every non-null value should normally be video-v1.mp4.
select coalesce(video_key, '(none)') as video_key, count(*)
from exercises
group by 1
order by 2 desc;
```

Add the column if Hibernate has not already done so:

```sql
alter table exercises add column if not exists slug varchar(160);
```

Run the application once (or run the seeder) so it backfills slugs.

Validate:

```sql
select count(*) as total,
       count(*) filter (where slug is null or slug = '') as missing,
       count(distinct slug) as distinct_slugs
from exercises;

select slug, count(*)
from exercises
group by slug
having count(*) > 1;
```

Only after `missing = 0` and no duplicate rows:

```sql
create unique index if not exists ux_exercises_slug on exercises (slug);
alter table exercises alter column slug set not null;
```

After this succeeds, the entity can be changed to `nullable = false` if desired. Keep the explicit SQL as the source of truth for deployed databases; `ddl-auto=update` is not a migration tool.

---

## 5. Upload Script Changes

File: `flexfit-be/scripts/upload-exercise-video.py`

### Path handling

Replace the UUID-based path:

```python
def object_path(self, exercise_id: str, object_name: str) -> str:
    return f"{OBJECT_PREFIX}/{exercise_id}/{object_name}"
```

with a slug-based path:

```python
def object_path(self, slug: str, object_name: str) -> str:
    return f"{OBJECT_PREFIX}/{slug}/{object_name}"
```

Add slug validation before any upload/update:

```python
if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
    fail(f"invalid exercise slug: {slug!r}")
```

### Database queries

Update `load_exercises` to select `slug`:

```sql
select id, name, coalesce(slug, ''), coalesce(video_key, '')
from exercises
```

If any exercise has no slug, fail with an instruction to start the backend/seeder or run the slug backfill first.

Update `set_video_key` to update by slug instead of UUID:

```sql
update exercises
set video_key = 'video-v1.mp4'
where slug = '<slug>'
returning id
```

Remove the UUID-format guard or replace it with the slug guard.

### New migration command

Add a mode such as:

```bash
scripts/upload-exercise-video.py --copy-legacy --dry-run
scripts/upload-exercise-video.py --copy-legacy
```

Behavior:

1. Read every exercise with a non-null `video_key`.
2. Source key: `exercises/<exercise.id>/<video_key>`.
3. Destination key: `exercises/<exercise.slug>/<video_key>`.
4. Copy server-side using the Supabase copy API if available; otherwise download and re-upload with the existing `requests` code.
5. Verify the destination with a `HEAD` request and compare `Content-Length` with the source/known size.
6. Do not delete old objects in this step.
7. Skip exercises with no `video_key`.

Add an optional cleanup command later:

```bash
scripts/upload-exercise-video.py --delete-legacy
```

Only run it after the new paths have been live for an agreed soak period.

### Default object name

Keep `DEFAULT_OBJECT = "video-v1.mp4"`.

The URL builder should still use the stored `videoKey` rather than hardcoding the filename in Java. This keeps legacy or exceptional `.mov`/`.webm` objects working while the convention remains `video-v1.mp4`.

### Environment synchronization

`video_key` still lives in each environment's database. After uploading to the shared bucket, run the sync against every environment database:

```bash
scripts/upload-exercise-video.py --sync --db-url "postgresql://…/flexfit_staging"
scripts/upload-exercise-video.py --sync --db-url "postgresql://…/flexfit_prod"
```

`--sync` checks the bucket for `exercises/<slug>/video-v1.mp4` and sets `video_key` where the object exists. This is the required operational step when a new video is added. If this becomes noisy, add a manifest or a `--sync-all` configuration later; do not make the app runtime depend on Supabase credentials just to discover media.

---

## 6. Frontend Changes

### Types

File: `flexfit-fe/types/workout.ts`

Add to `WorkoutExercise`:

```ts
slug: string | null;
videoUrl: string | null;
```

Keep `videoKey` during the transition if desired.

### Exercise video component

File: `flexfit-fe/app/(protected)/exercise/_components/ExerciseFocus.tsx`

Replace:

```ts
import { exerciseVideoUrl } from "@/lib/exerciseMedia";

const videoUrl = useMemo(
  () => exerciseVideoUrl(exercise.exerciseId, exercise.videoKey),
  [exercise.exerciseId, exercise.videoKey],
);
```

with:

```ts
const videoUrl = exercise.videoUrl;
```

The existing `videoFailed` fallback continues to handle missing/broken objects. Keep `key={videoUrl}` on the `<video>` element so a changed URL resets the player.

### Remove client-side storage coupling

After the API is deployed and verified:

- Delete `flexfit-fe/lib/exerciseMedia.ts`.
- Remove `NEXT_PUBLIC_SUPABASE_URL` from `flexfit-fe/.env`.
- Remove any remaining imports of `exerciseMedia`.
- Keep the backend `MEDIA_PUBLIC_BASE_URL` as the only place that knows the storage provider.

### Exercise library responses

If the exercise library UI displays videos, use `videoUrl` from `ExerciseResponse` in the same way. Do not concatenate Supabase paths in components.

---

## 7. Migration Runbook

Run these steps in order. Keep old objects until the end.

### Step 1 — Preflight

- Back up the target database.
- List/inventory the bucket:

  ```text
  exercise-media/exercises/<uuid>/<video_key>
  ```

- Record distinct `video_key` values. If any non-null value is not `video-v1.mp4`, decide whether to:
  - keep it (the helper uses `videoKey`, so it still works), or
  - normalize it to `video-v1.mp4` by re-uploading/re-encoding and updating the row.

### Step 2 — Deploy backend with nullable slug

- Deploy the entity/DTO/seeder changes.
- Start one instance so Hibernate adds `slug` and the seeder backfills it.
- Verify:

  ```sql
  select count(*) filter (where slug is null) from exercises;
  ```

### Step 3 — Enforce the slug constraint

Run the validation and constraint SQL from section 4.6 in each environment:

```sql
create unique index if not exists ux_exercises_slug on exercises (slug);
alter table exercises alter column slug set not null;
```

### Step 4 — Copy existing objects

From a machine with Supabase credentials:

```bash
cd flexfit-be
python scripts/upload-exercise-video.py --copy-legacy --dry-run
python scripts/upload-exercise-video.py --copy-legacy
```

Verify a sample with a browser or `HEAD` request:

```text
https://<project>.supabase.co/storage/v1/object/public/exercise-media/exercises/<slug>/<video_key>
```

Check that the size matches the old object.

### Step 5 — Deploy API and frontend

- Deploy the backend that returns `slug`/`videoUrl`.
- Deploy the frontend that consumes `exercise.videoUrl`.
- Verify the exercise detail screen and today's workout screen play videos.
- Verify exercises without `video_key` make no media request and show the fallback.

### Step 6 — Verify all environments

For each environment database:

- Confirm the same slug values exist.
- Confirm `video_key` is set for the intended exercises.
- Call an endpoint such as `GET /api/v1/exercises/{id}` and confirm `videoUrl` points to the shared object.
- Run:

  ```bash
  scripts/upload-exercise-video.py --status --db-url "<env database URL>"
  ```

### Step 7 — Cleanup

- After the new path has been stable for a soak period, delete the old `exercises/<uuid>/` folders.
- Remove `videoKey` from frontend types if nothing uses it.
- Update `README.md` and `CLAUDE.md` references from `<exerciseId>` to `<exercise-slug>`.

---

## 8. Testing Checklist

### Backend

- [ ] `./mvnw clean install`
- [ ] Application starts with `MEDIA_PUBLIC_BASE_URL` set and unset.
- [ ] Seeder backfills slugs for existing rows.
- [ ] Seeder is idempotent: a second run does not change existing slugs or duplicate rows.
- [ ] Slug collision is detected and reported clearly.
- [ ] `GET /api/v1/exercises` and `GET /api/v1/exercises/{id}` return `slug` and `videoUrl`.
- [ ] Workout responses and alternative-exercise responses include `slug` and `videoUrl`.
- [ ] Rows with `video_key = null` return `videoUrl = null`.

### Upload script

- [ ] `--status` reports progress using the new slug path.
- [ ] `--sync --dry-run` lists objects that exist under slug paths.
- [ ] `--sync` updates `video_key` by slug.
- [ ] `--exercise "Bench Press" file.mp4` uploads to `exercises/bench-press/video-v1.mp4`.
- [ ] `--copy-legacy --dry-run` lists every legacy object and target.
- [ ] `--copy-legacy` verifies sizes and leaves old objects untouched.
- [ ] A file with an invalid slug is rejected before upload.
- [ ] A missing slug fails with an actionable error.

### Frontend

- [ ] Exercise detail video plays from `exercise.videoUrl`.
- [ ] Today's workout video plays.
- [ ] Missing video shows the fallback without a network request.
- [ ] Broken/404 video falls back gracefully.
- [ ] Replacing a video file is visible after a hard refresh or cache expiry.

### Environments

- [ ] Local, staging, and production use their own databases.
- [ ] All environments return the same slug-based URL for the same exercise.
- [ ] `--sync` is run against each environment after a new upload.

---

## 9. Rollback

- Do not delete legacy UUID objects until the new path has been stable.
- If the backend or frontend must be rolled back, old objects still exist at the old paths.
- The added `slug` column is harmless to old code; it can remain.
- If `videoUrl` causes a client issue, the old `videoKey` field is still returned during the transition, but the old frontend requires the old UUID path objects. Keep those objects until both sides are stable.

---

## 10. Operational Notes

### Caching and replacements

The path is constant for a given exercise (`video-v1.mp4`). Replacing the file in place can leave stale content in browser/CDN caches.

For this phase:

- Keep replacements infrequent.
- Set a short cache TTL on the uploaded object, or verify with a hard refresh.
- If replacements become common, evolve the convention to a content-hash filename such as:

  ```text
  exercises/<slug>/<sha256-prefix>.mp4
  ```

  That requires storing the resolved key (which is why `video_path` was considered) or an `exercise_media` table. Do this only when the requirement appears.

### Separate databases per environment

- Prefer a real migration tool (Flyway/Liquibase) over `ddl-auto=update` as the number of environments grows.
- Run the seeder once per environment; avoid multiple instances racing the same seed on first boot.
- Reference data (slug, exercise definitions) is code-owned and deterministic; user data remains environment-specific.

### Future media

When user-uploaded videos are added:

- Create a separate `user_media`/`exercise_media` table with owner, visibility, provider, bucket, object key, MIME type, and status.
- Use per-environment buckets for private/user data.
- Keep the public exercise demo catalog separate.

---

## 11. File Change Summary

| File | Change |
|---|---|
| `flexfit-be/.../entity/Exercise.java` | Add nullable `slug` column; no `video_path`. |
| `flexfit-be/.../seeder/ExerciseSeeder.java` | Generate/backfill immutable slugs; collision handling; preserve existing slugs. |
| `flexfit-be/.../config/MediaProperties.java` | New config bean for `app.media.base-url`. |
| `flexfit-be/.../Application.java` | Enable configuration properties scanning. |
| `flexfit-be/src/main/resources/application.properties` | Add `app.media.base-url`. |
| `flexfit-be/.../dto/response/ExerciseResponse.java` | Add `slug`, `videoUrl`. |
| `flexfit-be/.../dto/response/WorkoutExerciseResponse.java` | Add `slug`, `videoUrl`. |
| `flexfit-be/.../service/impl/ExerciseServiceImpl.java` | Map slug and computed URL. |
| `flexfit-be/.../service/impl/WorkoutServiceImpl.java` | Map slug and computed URL in both response builders. |
| `flexfit-be/scripts/upload-exercise-video.py` | Slug paths, slug-based updates, legacy copy mode, diagnostics. |
| `flexfit-be/.env` / deployment env | Add `MEDIA_PUBLIC_BASE_URL`. |
| `flexfit-be/README.md` | Document slug paths and the new env var. |
| `flexfit-fe/types/workout.ts` | Add `slug` and `videoUrl`. |
| `flexfit-fe/app/(protected)/exercise/_components/ExerciseFocus.tsx` | Use `exercise.videoUrl`. |
| `flexfit-fe/lib/exerciseMedia.ts` | Delete after the API migration is verified. |
| `flexfit-fe/.env` | Remove `NEXT_PUBLIC_SUPABASE_URL` after verification. |

---

## 12. Acceptance Criteria

- The same exercise has the same media URL in every environment regardless of its database UUID.
- Uploading a video once makes it available to all environments after `--sync` (or the chosen metadata propagation step).
- The frontend no longer constructs Supabase paths or knows the bucket name.
- No `video_path` column exists; `slug` + `video_key` fully determine the object location.
- Existing exercises keep their UUIDs, foreign keys, workout history, and user data.
- Legacy UUID objects remain available until the migration is verified and intentionally cleaned up.
