# FlexFit — Frontend

Personalized fitness coaching app frontend built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **React 19**.

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animations | `motion/react` |
| Client state | Zustand |
| Server state | TanStack Query |
| Icons | Lucide React |
| Package manager | Bun |

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |

## Project structure

```
app/              Next.js App Router pages & layouts
├── (auth)/       Auth flow (login, signup, forgot password)
├── (public)/     Public splash screen
└── (protected)/  Authenticated routes (onboarding, dashboard)
components/       Shared UI components
hooks/            Custom React hooks (useAuth, useUserProfile, …)
lib/              Utility functions (API client, narrow, fieldClass)
services/         API call functions (auth, profile, onboarding)
store/            Zustand stores (auth)
types/            TypeScript type definitions
```

## Conventions

- **API calls** go through `lib/api.ts` — never fetch directly in components
- **Client state** → Zustand, **Server state** → TanStack Query
- **Animations** use `motion/react` (not framer-motion)
- No `axios`, no `localStorage` for auth, no inline styles
- Auth uses HttpOnly cookies (handled by backend)

## Backend

Java Spring Boot API at `http://localhost:8080` (base path: `/api/v1`).
