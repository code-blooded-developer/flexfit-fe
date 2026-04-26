# FlexFit Frontend — Agent Instructions

Refer to CLAUDE.md for full project conventions, stack, and rules.

## Quick Reference

- Package manager: Bun (`bun add`, `bun dev`, `bun build`)
- All API calls via `lib/api.ts` — never fetch directly in components
- State: Zustand for client state, TanStack Query for server state
- Animations: `motion/react` (not framer-motion)
- No axios, no localStorage for auth, no inline styles
