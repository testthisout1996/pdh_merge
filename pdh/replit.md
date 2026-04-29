# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the **Pharmacy Dispensing Hub** — a single-page web app used by community pharmacy staff to launch dispensary tools (PIL printer, prednisolone reducing regimen calculator, and the upcoming to-follow slip generator).

## Artifacts

- `artifacts/pharmacy-hub` — React + Vite frontend at `/`. The hub landing page (hero, tools, FAQ, service status) plus placeholder routes at `/tools/pil-printer` and `/tools/prednisolone-calculator` where the real tools will be plugged in later.
- `artifacts/api-server` — shared Express API (not yet used by the hub).
- `artifacts/mockup-sandbox` — design sandbox.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 18, Vite, Tailwind v4, shadcn/ui, framer-motion, wouter, lucide-react
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not currently used)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle) for the API; Vite for the frontend

## Pharmacy Hub design notes

- Light pastel palette: soft rose/coral red, lavender/violet, periwinkle/sky blue on near-white.
- White sticky navbar with logo, Home, Tools dropdown (PIL Printer, Prednisolone Calculator, To-Follow Slip Generator marked Coming Soon and disabled), FAQ, Service Status.
- Sections on `/`: Hero, Tools, FAQ (accordion), Service Status (mini status page), Footer.
- No backend wiring on the hub — self-contained frontend. The individual tools will be integrated into the placeholder routes later.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/pharmacy-hub run dev` — run the hub frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
