# FlexFit Frontend

## Project Overview

Next.js 15 App Router frontend for FlexFit — a personalized fitness app.
Backend is Java Spring Boot at `http://localhost:8080`.

## Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Animations: Motion (motion/react)
- State: Zustand
- Server state: TanStack Query
- Package manager: Bun
- Icons: Lucide React

## Key Conventions

### Folder Structure

- `app/` — Next.js App Router pages and layouts
- `components/` — Shared reusable components
- `hooks/` — Custom React hooks (e.g. useAuth)
- `lib/` — Utility/config (api.ts, apiError.ts)
- `services/` — API call functions grouped by domain
- `store/` — Zustand stores
- `types/` — TypeScript types grouped by domain

### API

- All requests go through `lib/api.ts`
- Base URL: `NEXT_PUBLIC_API_URL/api/v1`
- Backend uses a standard envelope: `{ success, status, message, data, timestamp }`
- `lib/api.ts` unwraps the envelope — callers receive `data` directly
- Errors are thrown as `ApiError` from `lib/apiError.ts`
- Auth tokens are HttpOnly cookies set by BE — never handled on frontend
- Always use `credentials: 'include'` (already handled in lib/api.ts)
- Route protection is handled in `proxy.ts` (Next.js 16 renamed middleware → proxy)

### Auth

- Auth state lives in `store/authStore.ts`
- Use `useAuth()` hook from `hooks/useAuth.ts` in pages
- After sign in: redirect to `/dashboard` if profile complete, else `/onboarding`
- After sign up: always redirect to `/onboarding`

### Components

- Use `motion` from `motion/react` for animations — not `framer-motion`
- Use Lucide React for icons
- Tailwind only for styling — no CSS modules or inline styles
- All client components must have `"use client"` at the top

### Forms

- Validate on submit, clear field error on change
- Show field errors with `<ErrorMsg />` pattern (animated with AnimatePresence)
- Show API errors as a banner above the form fields

## Commands

- `bun dev` — start dev server
- `bun build` — production build
- `bun lint` — run ESLint

## Environment Variables

- `NEXT_PUBLIC_API_URL` — Java backend base URL (e.g. http://localhost:8080)

## Do Not

- Do not use axios — use native fetch via lib/api.ts
- Do not use framer-motion — use motion/react
- Do not store tokens in localStorage or state
- Do not create CSS modules — use Tailwind
- Do not use `any` type — use proper types or ApiError instanceof checks
