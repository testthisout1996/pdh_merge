# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Hosts the **Pharmacy Dispensing Hub** — a single-page web app used by community pharmacy staff to launch dispensary tools (PIL printer, prednisolone reducing regimen calculator, and the upcoming to-follow slip generator).

## Artifacts

- `artifacts/pharmacy-hub` — React + Vite frontend at `/`. The hub landing page (hero, tools, FAQ, service status) plus the PIL Printer tool at `/tools/pil-printer` (MHRA Patient Information Leaflet search/bulk-update/status, restyled to match the PDH theme) and a placeholder at `/tools/prednisolone-calculator`. Dev server proxies `/api` → `http://localhost:${API_PORT ?? 8080}`.
- `artifacts/api-server` — shared Express API on port 8080. Routes: `GET /api/healthz`, `GET /api/mhra/search`, `GET /api/mhra/check-url`, `GET /api/status`, plus auth routes (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`) and user management routes (`/api/users` CRUD, `/api/users/:id/pin`, `/api/users/:id/role`). Uses `express-session` for server-side sessions. User data persisted to `data/users.json` in the api-server working directory. The MHRA endpoints proxy Azure Search (`mhraproducts4853.search.windows.net`) filtered by `doc_type eq 'Pil' and territory eq 'UK'`.
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

## Auth System

- PIN-based login at `/login`. All routes except `/login` are protected — unauthenticated users are redirected.
- Three roles: `superadmin` (PIN: 1111), `admin` (PIN: 9999, changeable), `basic` (new users default).
- Superadmin: full control — change roles, reset any PIN, manage admin PIN, add/delete users.
- Admin: add/delete basic users, reset basic user PINs.
- Basic: access to all tools. Can change their own PIN.
- `/admin` page: accessible to admin and superadmin only. Non-admins redirected to `/`.
- User store: `data/users.json` relative to api-server cwd (auto-created on first run).
- Frontend: `AuthContext.tsx`, `ProtectedRoute.tsx`, `pages/Login.tsx`, `pages/Admin.tsx`.

## Pharmacy Hub design notes

- Light pastel palette: soft rose/coral red, lavender/violet, periwinkle/sky blue on near-white.
- White sticky navbar with logo, Home, Tools dropdown (PIL Printer, Prednisolone Calculator, To-Follow Slip Generator marked Coming Soon and disabled), FAQ, Service Status.
- Navbar shows logged-in user name with avatar dropdown (user management link for admins, sign-out).
- Sections on `/`: Hero, Tools, FAQ (accordion), Service Status (mini status page), Footer.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/pharmacy-hub run dev` — run the hub frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
