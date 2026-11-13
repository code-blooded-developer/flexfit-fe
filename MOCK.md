# Mock mode — reviewer checklist

Runs the app with no backend, no auth and no Supabase. Everything below is
fixture-only; none of it ships when the flag is off.

## Start

```bash
bun run dev:mock        # same as NEXT_PUBLIC_USE_MOCKS=1 bun dev
```

Open **`http://localhost:3000/workout`** — not `/`, which is a splash screen
that redirects to `/auth` after 2.5s.

Reviewer tooling: **`/dev/seed`**.

Flags are inlined at build time. Changing one means restarting the dev server.

| Flag | Effect |
|---|---|
| `NEXT_PUBLIC_USE_MOCKS=1` | Fixtures on, auth off, service worker off |

## What is faked

| Real dependency | Fixture |
|---|---|
| Spring API on `localhost:8080` | `app/api/v1/[...path]/route.ts` |
| Auth cookies (`ACCESS_TOKEN`) | `proxy.ts` early return |
| Supabase exercise videos | `videoKey: null` → emoji fallback (unchanged code path) |
| Google Fonts | vendored in `public/fonts`, no network needed (see `app/layout.tsx`) |

The fixture API keeps state in memory on `globalThis`, so logged sets survive
Next's dev-mode module reloads but reset when the server restarts.

## Scenarios (`/dev/seed`)

Every scenario writes a **version 1** blob to `flexfit.session` and hard-navigates,
which is exactly what a force-kill leaves behind. Version 1 is deliberate: it is
the format the current release writes, so a fix that bumps the schema has to keep
reading it.

| Scenario | What it simulates | Expected after a correct fix |
|---|---|---|
| Overnight — 14h away after 45 min | Session killed mid-workout, reopened next day | Under 48 min, paused. **`14:00:00` means the bug is still there.** |
| Stale — running for 30h | A session left open for a day and a half | No resume at all: `/workout` offers **Start Workout** |
| Quick switch — 30 min in, 5 s away | App switch to read a text | **Not `0:00`** — a reload must not throw the workout away. 2 min (clamped) or ~30 min (liveness tracked) are both fine. |
| Paused — 47 min banked | Back button, then reload | 47 min, paused, unchanged |
| Mid-rest — 2.5s left | Phone locked during rest | Rest resolves itself, no tap needed |
| Almost done — one exercise left | Marks everything but the last exercise complete | **Resume workout** → **Done** finishes the workout and calls `POST /complete` |
| Clear session | Clean slate | Button on `/workout` reads "Start Workout" |

**Clear between scenarios.** A seeded session survives reload; leaving one in
place makes the next check inherit stale state.

### Why the overnight seed looks the way it does

```
runningSince = now - 14h          // workout started 14h ago
lastSeenAt   = now - 14h + 45min  // last heartbeat, 45 min in
```

`lastSeenAt` is ignored by the current code (which is why the bug reproduces) and
is offered to a heartbeat-style fix. **No fix is required to read it** — a fix
that clamps every unproven gap, or that records liveness under a different name,
still passes the UI check as long as the clock is not 14h. Two different correct
fixes therefore show different numbers (≈47 min vs ≈2 min); that is fine.

Because of that ambiguity the UI check is only a coarse "not 14h" gate. The
exact number is asserted by the agent's own tests and by the reviewer's
independent test, which drives the store directly.

### Console alternative

On `/exercise` with a running session:

```js
const k = "flexfit.session", v = JSON.parse(localStorage.getItem(k));
v.state.runningSince = Date.now() - 14 * 3600e3;
localStorage.setItem(k, JSON.stringify(v));
location.reload();
```

## Endpoints

| Method | Path |
|---|---|
| GET | `/workouts/today` |
| POST | `/workouts/today/swap` (returns a **new** workout id) |
| GET | `/workouts/today/alternate-muscles` |
| GET | `/workouts/:id/alternatives` |
| POST | `/workouts/:id/exercises` |
| PUT | `/workouts/:id/exercises/:eid/replace/:alt` |
| DELETE | `/workouts/:id/exercises/:eid` |
| POST | `/workouts/:id/exercises/:eid/sets` |
| DELETE | `/workouts/:id/exercises/:eid/sets/:sid` |
| POST | `/workouts/:id/complete` |
| GET | `/profiles` |
| POST | any `/auth/*` |

Reviewer-only: `GET /api/v1/__mock/state`, `POST /api/v1/__mock/reset`.

## Gotchas that look like bugs

- **`/` is the splash screen.** Start at `/workout`.
- **Service worker** is unregistered on load in mock mode. If you still see old
  behaviour, hard-reload once.
- **Any fixture 500** on `/workouts/today` sends `lib/api.ts` through a refresh
  and then `window.location.href = "/login"`. That redirect is the API client,
  not the route guard.
- **HMR** keeps fixture state (it lives on `globalThis`), but a dev-server
  restart resets it.
- **`flexfit.session` is per-origin.** `localhost` and `127.0.0.1` are different
  stores.

## Scope

`lib/mock/**`, `app/api/v1/**` and `app/dev/**` exist only for local review.
Application changes belong in `store/`, `hooks/`, `lib/` and `app/(protected)/`.
If a diff touches the fixture layer, treat it as out of scope.
