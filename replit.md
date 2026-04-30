# Project

This Replit hosts the **Pharmacy Dispensing Hub (PDH)** — a single unified web app that combines the original PDH hub with the **MHRA PIL Finder** functionality, all sharing one navbar, theme, and visual language.

## Layout

- `pdh/` — the active project (pnpm workspace). All work happens here.
  - `artifacts/pharmacy-hub` — React + Vite frontend (port 5000). Hub landing page plus tools:
    - `/tools/pil-printer` — MHRA PIL search/bulk-update/status, restyled to match the PDH theme.
    - `/tools/prednisolone-calculator` — placeholder.
  - `artifacts/api-server` — Express 5 API on port 8080. Routes: `/api/healthz`, `/api/mhra/search`, `/api/mhra/check-url`, `/api/status`. Proxies Azure Search for PIL data.
- `mhraproject/` — original standalone MHRA PIL Finder. Kept for reference; its functionality has been integrated into `pdh/artifacts/pharmacy-hub` and `pdh/artifacts/api-server`.

## Stack

- Node.js 24, pnpm 10
- React 18, Vite 7, Tailwind v4, shadcn/ui, framer-motion, wouter, lucide-react
- Express 5 API, esbuild bundle

## Workflows

- **Start application** — frontend, port 5000 (webview): `cd pdh && PORT=5000 BASE_PATH=/ API_PORT=8080 pnpm --filter @workspace/pharmacy-hub run dev`
- **API Server** — backend, port 8080 (console): `cd pdh && PORT=8080 NODE_ENV=development pnpm --filter @workspace/api-server run start`

The Vite dev server proxies `/api` → `http://localhost:8080`, so the frontend and API are served as one site on port 5000.

## Building / installing

- Install: `cd pdh && pnpm install`
- Build API: `cd pdh && pnpm --filter @workspace/api-server run build`
- Typecheck all: `cd pdh && pnpm run typecheck`
