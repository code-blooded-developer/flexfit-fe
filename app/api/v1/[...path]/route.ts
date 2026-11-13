import type { NextRequest } from "next/server";

import { USE_MOCKS } from "@/lib/mock/config";
import * as db from "@/lib/mock/db";
import type { WorkoutSetInput } from "@/types/workout";

/**
 * Fixture API for `NEXT_PUBLIC_USE_MOCKS=1`.
 *
 * Same shape as the Spring backend: every response is the standard envelope
 * `{ success, status, message, data, timestamp }`, which `lib/api.ts` unwraps.
 * When the flag is off every route 404s, so this file is inert in production.
 */

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };
type Method = "GET" | "POST" | "PUT" | "DELETE";

const envelope = <T,>(data: T, status = 200, message = "OK") => ({
  success: status < 400,
  status,
  message,
  data: status < 400 ? data : null,
  timestamp: new Date().toISOString(),
});

const ok = <T,>(data: T) => Response.json(envelope(data));
const bad = (message: string, status = 400) =>
  Response.json(envelope(null, status, message), { status });

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function toSetInput(raw: Record<string, unknown>): WorkoutSetInput {
  return {
    setNumber: num(raw.setNumber) ?? 1,
    weight: num(raw.weight),
    reps: num(raw.reps),
    distance: num(raw.distance),
    durationSeconds: num(raw.durationSeconds),
    notes: typeof raw.notes === "string" ? raw.notes : null,
  };
}

async function handle(
  method: Method,
  req: NextRequest,
  ctx: Ctx,
): Promise<Response> {
  if (!USE_MOCKS) {
    return bad(
      "Mock mode is off. Start the app with NEXT_PUBLIC_USE_MOCKS=1.",
      404,
    );
  }

  const { path } = await ctx.params;
  const route = path.join("/");
  const body =
    method === "POST" || method === "PUT"
      ? asRecord(await req.json().catch(() => null))
      : {};

  /* ── Auth: never fail, so nothing triggers the 401 → /login redirect ── */
  if (route.startsWith("auth/")) return ok(null);

  /* ── Profile: only onboarding/equipment-selection use it ── */
  if (method === "GET" && route === "profiles") {
    return ok({
      userId: "mock-user",
      name: "Mock Athlete",
      gender: "OTHER",
      dateOfBirth: null,
      height: 175,
      weight: 75,
      fitnessGoal: "GAIN_MUSCLE",
      experienceLevel: "INTERMEDIATE",
      workoutDaysPerWeek: 4,
      workoutDurationMinutes: 45,
      workoutEnvironment: "GYM",
      workoutSplit: "UPPER_LOWER",
      profileComplete: true,
    });
  }

  /* ── Reviewer tooling ── */
  if (method === "GET" && route === "__mock/state") {
    return ok(db.dbSnapshot());
  }
  if (method === "POST" && route === "__mock/reset") {
    db.resetDb();
    return ok(db.dbSnapshot());
  }

  /* ── Workouts ── */
  if (method === "GET" && route === "workouts/today") {
    return ok(db.todayWorkout());
  }

  if (method === "GET" && route === "workouts/today/alternate-muscles") {
    return ok(db.alternateMuscles());
  }

  if (method === "POST" && route === "workouts/today/swap") {
    return ok(db.swapWorkout(String(body.muscle ?? "LEGS")));
  }

  if (method === "GET" && /^workouts\/[^/]+\/alternatives$/.test(route)) {
    return ok(db.alternatives());
  }

  const complete = route.match(/^workouts\/([^/]+)\/complete$/);
  if (method === "POST" && complete) {
    return ok(db.completeWorkout());
  }

  const setCollection = route.match(
    /^workouts\/([^/]+)\/exercises\/([^/]+)\/sets$/,
  );
  if (method === "POST" && setCollection) {
    const set = db.logSet(setCollection[2], toSetInput(body));
    return set ? ok(set) : bad("Unknown exercise", 404);
  }

  const setItem = route.match(
    /^workouts\/([^/]+)\/exercises\/([^/]+)\/sets\/([^/]+)$/,
  );
  if (method === "DELETE" && setItem) {
    return db.deleteSet(setItem[2], setItem[3])
      ? ok(null)
      : bad("Unknown set", 404);
  }

  const replace = route.match(
    /^workouts\/([^/]+)\/exercises\/([^/]+)\/replace\/([^/]+)$/,
  );
  if (method === "PUT" && replace) {
    const workout = db.replaceExercise(replace[2], replace[3]);
    return workout ? ok(workout) : bad("Unknown exercise", 404);
  }

  const exerciseItem = route.match(/^workouts\/([^/]+)\/exercises\/([^/]+)$/);
  if (method === "DELETE" && exerciseItem) {
    const workout = db.deleteExercise(exerciseItem[2]);
    return workout ? ok(workout) : bad("Unknown exercise", 404);
  }

  const exerciseCollection = route.match(/^workouts\/([^/]+)\/exercises$/);
  if (method === "POST" && exerciseCollection) {
    const ids = Array.isArray(body.exerciseIds)
      ? body.exerciseIds.filter((id): id is string => typeof id === "string")
      : [];
    return ok(db.addExercises(ids));
  }

  return bad(`No fixture for ${method} /api/v1/${route}`, 404);
}

export const GET = (req: NextRequest, ctx: Ctx) => handle("GET", req, ctx);
export const POST = (req: NextRequest, ctx: Ctx) => handle("POST", req, ctx);
export const PUT = (req: NextRequest, ctx: Ctx) => handle("PUT", req, ctx);
export const DELETE = (req: NextRequest, ctx: Ctx) => handle("DELETE", req, ctx);
