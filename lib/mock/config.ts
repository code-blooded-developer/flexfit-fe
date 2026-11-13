/**
 * Offline fixture mode.
 *
 *   NEXT_PUBLIC_USE_MOCKS=1 bun dev
 *
 * `NEXT_PUBLIC_*` is inlined at build time, so the flag has to be set before
 * the dev server starts — change it and restart. It gates exactly four things:
 *
 *   lib/api.ts                    → same-origin base URL
 *   proxy.ts                      → the auth-cookie redirect
 *   app/api/v1/[...path]/route.ts → the fixture handlers
 *   app/provider.tsx              → service-worker registration (stale JS)
 *
 * Nothing else in the app branches on it.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "1";
